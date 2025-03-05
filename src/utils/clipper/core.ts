// @ts-ignore
import MP4Box, { DataStream } from "mp4box";
import Mux from "mux.js";

// 视频帧
export type ClipFrame = {
	// 图片 ImageBitMap
	img: ImageBitmap;
	// 帧时长
	duration: number | null;
	// 样本数量
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
		const response = await fetch(url, { signal });
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
		const frames: ClipFrame[] = [];
		let sampleCount = 0;
		let retryCount = 0;
		const MAX_RETRIES = 10;
		// 存储所有获取到的数据
		const allData: Uint8Array[] = [];
		let totalDataSize = 0;
		const controller: AbortController = new AbortController();
		const signal: AbortSignal = controller.signal;

		// 创建解码管道
		const createDecodePipeline = () => {
			type Pipeline = {
				// biome-ignore lint/suspicious/noExplicitAny: <unknow>
				mp4boxfile: any;
				// biome-ignore lint/suspicious/noExplicitAny: <unknow>
				transmuxer: any;
				videoDecoder: VideoDecoder | null;
				// biome-ignore lint/suspicious/noExplicitAny: <unknow>
				videoTrack: any | null;
				execute: () => Promise<ClipFrame[]>;
			};

			// @ts-ignore
			const mp4boxfile = MP4Box.createFile();
			// @ts-ignore
			const transmuxer = new Mux.mp4.Transmuxer();
			const videoDecoder: VideoDecoder | null = null;
			// biome-ignore lint/suspicious/noExplicitAny: <unknow>
			const videoTrack: any | null = null;

			const execute = () =>
				new Promise<ClipFrame[]>((resolve, reject) => {
					// 检查是否需要终止
					const checkTermination = () => {
						if (sampleCount >= nbSamples) {
							controller.abort();
							resolve(frames);
							return true;
						}
						return false;
					};
					// ts to mp4
					// biome-ignore lint/suspicious/noExplicitAny: <unknow>
					transmuxer.on("data", (segment: any) => {
						// if (checkTermination()) return;

						const initSegment = new Uint8Array(segment.initSegment);
						const data = new Uint8Array(segment.data);
						const buffer = new ArrayBuffer(
							initSegment.byteLength + data.byteLength,
						);
						const uint8View = new Uint8Array(buffer);
						uint8View.set(initSegment, 0);
						uint8View.set(data, initSegment.byteLength);

						// @ts-ignore
						buffer.fileStart = 0;
						mp4boxfile.appendBuffer(buffer);
					});

					// 提取帧图像
					// biome-ignore lint/suspicious/noExplicitAny: <unknow>
					mp4boxfile.onReady = (info: any) => {
						// if (checkTermination()) return;

						pipeline.videoTrack = info.videoTracks[0];
						if (pipeline.videoTrack) {
							mp4boxfile.setExtractionOptions(pipeline.videoTrack.id, "video", {
								nbSamples,
							});

							const { width, height } = this.calcClipSize(
								pipeline.videoTrack.track_width,
								pipeline.videoTrack.track_height,
								maxWidth,
								maxHeight,
							);

							pipeline.videoDecoder = new VideoDecoder({
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
										timestamp: videoFrame.timestamp,
									};

									sampleCount++;
									frames.push(frame);
									videoFrame.close();
									checkTermination();
								},
								error: reject,
							});

							pipeline.videoDecoder.configure({
								codec: pipeline.videoTrack.codec,
								codedWidth: pipeline.videoTrack.track_width,
								codedHeight: pipeline.videoTrack.track_height,
								hardwareAcceleration: "prefer-hardware",
								optimizeForLatency: true,
								description: this.getExtradata(mp4boxfile) as Uint8Array,
							});

							mp4boxfile.start();
						}
					};

					mp4boxfile.onSamples = (
						trackId: number,
						_: unknown,
						samples: MP4Sample[],
					) => {
						if (pipeline.videoTrack?.id === trackId) {
							mp4boxfile.stop();

							for (
								let i = 0;
								i < samples.length && sampleCount < nbSamples;
								i++
							) {
								const sample = samples[i];
								const isKeyFrame = sample.is_sync;
								const chunk = new EncodedVideoChunk({
									type: isKeyFrame ? "key" : "delta",
									timestamp:
										(sample.cts * 10e6) / pipeline.videoTrack.timescale,
									duration:
										(sample.duration * 10e6) / pipeline.videoTrack.timescale,
									data: sample.data,
								});

								if (pipeline.videoDecoder) {
									pipeline.videoDecoder.decode(chunk);
								}
							}
						}

						if (pipeline.videoDecoder) {
							pipeline.videoDecoder.flush().catch(reject);
						}
					};
				});

			const pipeline: Pipeline = {
				mp4boxfile,
				transmuxer,
				videoDecoder,
				videoTrack,
				execute,
			};

			return pipeline;
		};

		return new Promise((resolve, reject) => {
			let pipeline = createDecodePipeline();

			// 数据缓冲区
			const dataBuffer: Uint8Array[] = [];
			let totalBufferSize = 0;
			const MIN_BUFFER_SIZE = 1024 * 50; // 50KB 最小缓冲区大小

			// 处理累积的数据
			const processAccumulatedData = () => {
				if (totalBufferSize < MIN_BUFFER_SIZE) {
					return;
				}

				try {
					const combinedBuffer = new Uint8Array(totalBufferSize);
					let offset = 0;
					for (const chunk of dataBuffer) {
						combinedBuffer.set(chunk, offset);
						offset += chunk.length;
					}

					pipeline.transmuxer.push(combinedBuffer);
					pipeline.transmuxer.flush();
					pipeline.mp4boxfile.flush();

					// 清空缓冲区
					dataBuffer.length = 0;
					totalBufferSize = 0;
				} catch (error) {
					handleError(error);
				}
			};

			// 错误处理和重试
			const handleError = (error: unknown) => {
				console.warn(`解码重试 ${retryCount + 1}/${MAX_RETRIES}:`, error);

				if (retryCount < MAX_RETRIES) {
					retryCount++;
					// 重置计数器
					sampleCount = 0;
					frames.length = 0;
					try {
						// 创建新的解码管道
						pipeline = createDecodePipeline();

						// 处理所有累积的数据
						const combinedBuffer = new Uint8Array(totalDataSize);
						let offset = 0;
						for (const chunk of allData) {
							combinedBuffer.set(chunk, offset);
							offset += chunk.length;
						}

						pipeline
							.execute()
							.then(() => {
								resolve(frames);
							})
							.catch(handleError);

						pipeline.transmuxer.push(combinedBuffer);
						pipeline.transmuxer.flush();
						pipeline.mp4boxfile.flush();
					} catch (retryError) {
						handleError(retryError);
					}
				} else {
					reject(error);
				}
			};

			pipeline
				.execute()
				.then(() => {
					resolve(frames);
				})
				.catch(handleError);

			// 开始流式读取
			this.fetchBuffer(url, signal, (chunk) => {
				// 保存所有数据用于重试
				allData.push(chunk);
				totalDataSize += chunk.length;

				// 累积数据进行流式处理
				dataBuffer.push(chunk);
				totalBufferSize += chunk.length;

				// 当累积足够的数据时处理
				processAccumulatedData();
			}).catch((err) => {
				if (err instanceof DOMException && err.name === "AbortError") {
					console.log("fetchBuffer abort");
				} else {
					handleError(err);
				}
			});
		});
	}
}
