// @ts-ignore
import MP4Box, { DataStream } from "mp4box";
import Mux from "mux.js";

// 视频帧
export type ClipFrame = {
	// 图片 ImageBitMap
	img: ImageBitmap;
	// 帧时长
	duration: number | null;
	// 样本时间戳
	timestamp: number;
};

// MP4 样本类型定义
export type MP4Sample = {
	cts: number;
	dts: number;
	duration: number;
	is_sync: boolean;
	timescale: number;
	data: Uint8Array;
	description: Uint8Array;
	description_offset: number;
	description_length: number;
	number: number;
	track_id: number;
	size: number;
};

export type ClipperOptions = {
	// 缩略图宽度
	maxWidth: number;
	// 缩略图高度
	maxHeight: number;
	// 初始块大小（字节）
	initialChunkSize?: number;
	// 步进块大小（字节）
	stepChunkSize?: number;
};

// MP4 视频轨道类型定义
type MP4VideoTrack = {
	id: number;
	codec: string;
	track_width: number;
	track_height: number;
	timescale: number;
};

// MP4 文件信息类型定义
type MP4Info = {
	videoTracks: MP4VideoTrack[];
};

/**
 * 视频缩略图生成器核心
 * @link https://github.com/videojs/mux.js
 * @link https://github.com/gpac/mp4box.js
 */
export class ClipperCore {
	constructor(protected options: ClipperOptions) {}

	// 辅助函数：获取解码器所需的额外数据
	// biome-ignore lint/suspicious/noExplicitAny: <unknow>
	private getExtradata(mp4box: any): Uint8Array | null {
		try {
			const entry = mp4box.moov.traks[0].mdia.minf.stbl.stsd.entries[0];
			const box = entry.avcC ?? entry.hvcC ?? entry.vpcC;

			if (box != null) {
				const buffer = new ArrayBuffer(1024);
				// @ts-ignore
				const stream = new DataStream(buffer, 0, DataStream.BIG_ENDIAN);
				box.write(stream);
				return new Uint8Array(stream.buffer, 8, stream.position - 8);
			}
		} catch (error) {
			console.error("Error in getExtradata:", error);
		}
		return null;
	}

	// 根据 URL 获取 ArrayBuffer，支持流式读取
	public async fetchBuffer(
		url: string,
		signal?: AbortSignal,
		onData?: (chunk: Uint8Array) => void,
	): Promise<ArrayBuffer> {
		const response = await fetch(url, { signal, priority: "low" });
		if (!onData) {
			return await response.arrayBuffer();
		}

		const reader = response.body?.getReader();
		if (!reader) {
			throw new Error("Stream not supported");
		}

		const chunks: Uint8Array[] = [];
		let totalLength = 0;

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			if (value) {
				chunks.push(value);
				totalLength += value.length;
				onData(value);
			}
		}

		const result = new Uint8Array(totalLength);
		let offset = 0;
		for (const chunk of chunks) {
			result.set(chunk, offset);
			offset += chunk.length;
		}

		return result.buffer;
	}

	// 根据 URL 获取指定范围的 ArrayBuffer
	public async fetchBufferRange(
		url: string,
		start: number,
		end: number,
	): Promise<ArrayBuffer> {
		const response = await fetch(url, {
			headers: {
				Range: `bytes=${start}-${end}`,
			},
			priority: "low",
		});
		return await response.arrayBuffer();
	}

	// 计算缩略图大小
	private calcClipSize(
		width: number,
		height: number,
		maxWidth: number,
		maxHeight: number,
	) {
		const scale = Math.min(maxWidth / width, maxHeight / height);
		return {
			width: width * scale,
			height: height * scale,
		};
	}

	// 创建解码管道
	createDecodePipeline({
		nbSamples,
		maxWidth,
		maxHeight,
	}: {
		nbSamples: number;
		maxWidth: number;
		maxHeight: number;
	}) {
		let sampleCount = 0;
		const frames: ClipFrame[] = [];
		// @ts-ignore
		const mp4boxfile = MP4Box.createFile();
		// @ts-ignore
		const transmuxer = new Mux.mp4.Transmuxer();
		let videoDecoder: VideoDecoder | null = null;
		let videoTrack: MP4VideoTrack | null = null;
		let currentPosition = 0;

		const promise = new Promise<ClipFrame[]>((resolve, reject) => {
			// ts to mp4
			transmuxer.on(
				"data",
				(segment: { initSegment: ArrayBuffer; data: ArrayBuffer }) => {
					try {
						const initSegment = new Uint8Array(segment.initSegment);
						const data = new Uint8Array(segment.data);
						const buffer = new ArrayBuffer(
							initSegment.byteLength + data.byteLength,
						);
						const uint8View = new Uint8Array(buffer);
						uint8View.set(initSegment, 0);
						uint8View.set(data, initSegment.byteLength);

						// @ts-ignore
						buffer.fileStart = currentPosition;
						mp4boxfile.appendBuffer(buffer);
						mp4boxfile.flush();
					} catch (error) {
						reject(error);
					}
				},
			);

			transmuxer.on("error", (error: unknown) => {
				reject(error);
			});

			// 提取帧图像
			mp4boxfile.onReady = (info: MP4Info) => {
				videoTrack = info.videoTracks[0];
				if (videoTrack) {
					mp4boxfile.setExtractionOptions(videoTrack.id, "video", {
						nbSamples,
					});

					const { width, height } = this.calcClipSize(
						videoTrack.track_width,
						videoTrack.track_height,
						maxWidth,
						maxHeight,
					);

					videoDecoder = new VideoDecoder({
						output: async (videoFrame) => {
							const img = await createImageBitmap(videoFrame, {
								resizeQuality: "pixelated",
								premultiplyAlpha: "none",
								resizeWidth: width,
								resizeHeight: height,
							});

							const frame = {
								img,
								duration: videoFrame.duration,
								timestamp: videoFrame.timestamp / 10e6,
							};

							sampleCount++;
							frames.push(frame);
							if (sampleCount >= nbSamples) {
								resolve(frames);
							}
							videoFrame.close();
						},
						error: (error: unknown) => {
							reject(error);
						},
					});

					try {
						videoDecoder.configure({
							codec: videoTrack.codec,
							codedWidth: videoTrack.track_width,
							codedHeight: videoTrack.track_height,
							hardwareAcceleration: "prefer-hardware",
							optimizeForLatency: true,
							description: this.getExtradata(mp4boxfile) as Uint8Array,
						});
					} catch (error) {
						reject(error);
					}

					mp4boxfile.start();
				}
			};

			// 处理样本
			mp4boxfile.onSamples = (
				trackId: number,
				_: unknown,
				samples: MP4Sample[],
			) => {
				if (videoTrack?.id === trackId) {
					mp4boxfile.stop();

					for (let i = 0; i < samples.length && sampleCount < nbSamples; i++) {
						const sample = samples[i];
						const isKeyFrame = sample.is_sync;
						const chunk = new EncodedVideoChunk({
							type: isKeyFrame ? "key" : "delta",
							timestamp: (sample.cts * 10e6) / videoTrack.timescale,
							duration: (sample.duration * 10e6) / videoTrack.timescale,
							data: sample.data,
						});

						if (videoDecoder) {
							videoDecoder.decode(chunk);
						}
					}
				}

				if (videoDecoder) {
					videoDecoder.flush();
				}
			};
		});

		const push = (buffer: Uint8Array, pos: number) => {
			transmuxer.push(buffer);
			currentPosition = pos;
		};

		const pipeline = {
			mp4boxfile,
			transmuxer,
			videoDecoder,
			videoTrack,
			promise,
			push,
			frames,
		};

		return pipeline;
	}

	// 流式处理单个片段
	public async processStreamingSegment({
		url,
		nbSamples,
		maxWidth,
		maxHeight,
	}: {
		url: string;
		nbSamples: number;
		maxWidth: number;
		maxHeight: number;
		onFrame?: (frame: ClipFrame) => void;
	}): Promise<ClipFrame[]> {
		// 最大重试步数
		const MAX_STEP_COUNT = 5;
		// 默认步进块大小 256KB
		const DEFAULT_STEP_CHUNK_SIZE = 1024 * 256;
		// 默认初始块大小 256KB
		const DEFAULT_INITIAL_CHUNK_SIZE = DEFAULT_STEP_CHUNK_SIZE;
		// 初始块大小
		const initialChunkSize =
			this.options.initialChunkSize || DEFAULT_INITIAL_CHUNK_SIZE;
		// 步进块大小
		const stepChunkSize = this.options.stepChunkSize || DEFAULT_STEP_CHUNK_SIZE;

		// 重试次数
		let step = 0;
		// 当前位置
		let currentPosition = 0;
		// 当前块大小
		const currentChunkSize = initialChunkSize;

		return new Promise((resolve, reject) => {
			// 缓存 buffers
			const buffers: Uint8Array[] = [];
			// 缓存累积大小
			let bufferCumulativeSize = 0;

			const processNextChunk = async () => {
				try {
					// 创建解码管道
					const pipeline = this.createDecodePipeline({
						nbSamples,
						maxWidth,
						maxHeight,
					});
					// 获取当前块
					const endPosition = currentPosition + currentChunkSize;
					const buffer = await this.fetchBufferRange(
						url,
						currentPosition,
						endPosition - 1,
					);
					// 缓存当前块
					buffers.push(new Uint8Array(buffer));
					// 更新缓存累积大小
					bufferCumulativeSize += buffer.byteLength;

					// 创建累积缓冲区
					const cumulativeBuffer = new Uint8Array(bufferCumulativeSize);

					// 将所有缓存块复制到累积缓冲区
					let offset = 0;
					for (const buf of buffers) {
						cumulativeBuffer.set(buf, offset);
						offset += buf.byteLength;
					}

					// 推送累积缓冲区
					pipeline.push(cumulativeBuffer, 0);
					// 刷新解码器
					pipeline.transmuxer.flush();

					// 如果解码器没有返回帧，则重试
					if (pipeline.frames.length === 0) {
						Promise.race([
							pipeline.promise,
							// 超时检测
							new Promise((resolve) => {
								setTimeout(() => {
									resolve(new Error("timeout"));
								}, 100);
							}),
						])
							.then(async (result) => {
								if (
									(result instanceof Error || pipeline.frames.length === 0) &&
									step < MAX_STEP_COUNT
								) {
									currentPosition += stepChunkSize;
									step++;
									await processNextChunk();
								} else {
									resolve(pipeline.frames);
								}
							})
							.catch(async (error) => {
								if (error.name === "EncodingError") {
									// 如果解码错误，则重试
									currentPosition += stepChunkSize;
									step++;
									await processNextChunk();
								} else {
									reject(error);
								}
							});
					} else {
						resolve(pipeline.frames);
					}
				} catch (error) {
					reject(error);
				}
			};

			processNextChunk();
		});
	}
}
