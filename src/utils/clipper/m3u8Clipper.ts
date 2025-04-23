import { promiseDelay } from "../promise";
import { DemuxerTs } from "./demuxerTs";
import { FetchIO } from "./io/FetchIO";
import { HlsIO, type Segment } from "./io/HlsIO";
import { microsecTimebase, secTimebase, timebaseConvert } from "./timebase";

// 超时时间
const TIMEOUT_MS = 5000;

/**
 * M3U8 视频剪辑器构造选项
 */
type M3U8ClipperOptions = {
	// m3u8 url
	url: string;
	// 请求头
	headers?: Record<string, string>;
	// 请求选项
	fetchOptions?: RequestInit;
};

/**
 * M3U8 视频剪辑器跳转结果
 */
type M3u8ClipperSeekResult = {
	// 视频帧
	videoFrame: VideoFrame;
	// 帧实际时间(秒)
	frameTime: number;
	// 请求时间(秒)
	seekTime: number;
	// 消耗时间(毫秒)
	consumedTime: number;
};

/**
 * M3U8 视频剪辑器
 */
export class M3U8ClipperNew {
	hlsIo: HlsIO;
	constructor(private options: M3U8ClipperOptions) {
		this.hlsIo = new HlsIO();
	}

	/**
	 * 打开
	 * @description 打开 m3u8 文件
	 */
	async open(): Promise<void> {
		await this.hlsIo.open(this.options);
	}

	/**
	 * 跳转
	 * @description 跳转到分片截取 VideoFrame
	 * @param time 时间
	 * @param stream 是否只处理关键帧
	 * @returns 视频帧
	 */
	async seek(
		time: number,
		stream = false,
	): Promise<M3u8ClipperSeekResult | undefined> {
		// 当前时间
		const now = Date.now();
		// 视频帧
		let frame: VideoFrame | undefined;
		// 是否循环
		let loop = true;
		// 跳转
		const segment = await this.hlsIo.seek(time);
		// 流式读取
		const io = new FetchIO();
		const sampleQueue: EncodedVideoChunk[] = [];
		// 销毁
		const destroy = () => {
			loop = false;
			demuxer.destroy();
			videoDecoder.state !== "closed" && videoDecoder.close();
		};

		// 解码器
		const videoDecoder = new VideoDecoder({
			output: (videoFrame) => {
				const frameTime = this._getFrameRealTime(videoFrame.timestamp, segment);
				if (stream && !frame) {
					frame = videoFrame;
					return;
				}

				if (frameTime >= time && !frame) {
					frame = videoFrame;
					return;
				}
				videoFrame.close();
			},
			error: (error) => {
				console.error(error);
				destroy();
			},
		});

		// 解复用器
		const demuxer = new DemuxerTs({
			onConfig: (config) => {
				videoDecoder.configure(config);
			},
			onSamples: (_trackId, _user, samples) => {
				if (_user !== "video") {
					return;
				}
				for (const sample of samples) {
					// 解码器关闭
					if (videoDecoder.state === "closed") {
						return;
					}

					// 添加错误处理
					if (!sample.data || sample.data.byteLength === 0) {
						console.warn("跳过空样本");
						continue;
					}
					const chunk = new EncodedVideoChunk({
						type: sample.is_sync ? "key" : "delta",
						timestamp: (sample.cts * 1_000_000) / sample.timescale,
						duration: (sample.duration * 1_000_000) / sample.timescale,
						data: sample.data,
					});
					sampleQueue.push(chunk);
				}
			},
			onError: (error) => {
				console.error(error);
			},
		});

		if (stream) {
			io.streamChunks(segment.url, async (buffer) => {
				const insufficient = await demuxer.push(new Uint8Array(buffer));
				if (insufficient) {
					return true;
				}
				// 延迟 100ms 后检查 frame
				await promiseDelay(100);
				if (frame) {
					// 如果已经找到关键帧，则停止读取
					return false;
				}

				console.count("继续读取");
				// 如果未找到关键帧，则继续读取
				return true;
			});
		} else {
			const response = await io.fetchBufferRange(segment.url, 0, -1);
			const buffer = await response.arrayBuffer();
			await demuxer.push(new Uint8Array(buffer));
		}

		while (loop) {
			// 如果已经找到关键帧，则停止读取
			if (frame) {
				destroy();
				return {
					videoFrame: frame,
					frameTime: this._getFrameRealTime(frame.timestamp, segment),
					seekTime: time,
					consumedTime: Date.now() - now,
				};
			}
			// 如果超过超时时间，则销毁
			if (Date.now() - now > TIMEOUT_MS) {
				console.error(`m3u8Clipper seek timeout, time: ${time}`);
				destroy();
				return undefined;
			}

			// 如果存在样本队列，则解码
			if (sampleQueue.length > 0) {
				const chunk = sampleQueue.shift();
				if (chunk) {
					videoDecoder.decode(chunk);
					await videoDecoder.flush();
				}
			} else {
				await promiseDelay(0);
			}
		}
	}

	/**
	 * 获取帧的实际时间
	 * @param timestamp 时间戳 (微秒) 来源与 VideoFrame 或 EncodedVideoChunk
	 * @param segment 片段
	 * @returns 实际时间 (秒)
	 */
	private _getFrameRealTime(timestamp: number, segment: Segment): number {
		// 转换时间基
		const videoFrameTime = timebaseConvert(
			// Tips: 不知道为什么需要除以2,似乎是 mux.js 在封装 mp4 上有问题
			timestamp / 2,
			microsecTimebase,
			secTimebase,
		);
		// 转换时间基
		const frameTime = segment.timestamp + videoFrameTime;
		return frameTime;
	}

	/**
	 * 销毁
	 * @description 销毁 m3u8 剪辑器
	 */
	destroy() {
		this.hlsIo.destroy();
	}
}
