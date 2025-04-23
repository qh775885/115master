// @ts-ignore
import MP4Box, { DataStream } from "mp4box";
import Mux from "mux.js";
import type { MP4Info, MP4Sample } from "../../types/mp4box";
import type { ClipFrame } from "./core";

// MP4 视频轨道类型定义
type MP4VideoTrack = {
	id: number;
	codec: string;
	track_width: number;
	track_height: number;
	timescale: number;
};

// 转码器段数据类型
type TransmuxSegment = {
	initSegment: ArrayBuffer;
	data: ArrayBuffer;
	captions?: unknown;
	metadata?: unknown;
};

// 定义我们自己的MP4BoxFile类型，与实际使用匹配
interface ExtendedMP4BoxFile {
	appendBuffer: (buffer: ArrayBuffer) => void;
	onReady: (info: MP4Info) => void;
	setExtractionOptions: (
		id: number,
		type: string,
		options: {
			nbSamples: number;
		},
	) => void;
	start: () => void;
	stop: () => void;
	onSamples: (trackId: number, _: unknown, samples: MP4Sample[]) => void;
	flush: () => void;
	moov?: {
		traks: {
			mdia: {
				minf: {
					stbl: {
						stsd: {
							entries: {
								avcC?: unknown;
								hvcC?: unknown;
								vpcC?: unknown;
							}[];
						};
					};
				};
			};
		}[];
	};
}

// Mux.js 转码器类型
interface Transmuxer {
	on(event: "data", callback: (data: TransmuxSegment) => void): void;
	on(event: "done", callback: () => void): void;
	on(event: "error", callback: (error: unknown) => void): void;
	on(event: string, callback: (data: unknown) => void): void;
	push(data: Uint8Array): void;
	flush(): void;
}

// 解码管道选项
export type DecodePipelineOptions = {
	// 要提取的样本数量
	nbSamples: number;
	// 缩略图最大宽度
	maxWidth: number;
	// 缩略图最大高度
	maxHeight: number;
};

/**
 * 视频解码管道
 * 负责将MP4文件解码为视频帧
 */
export class DecodePipeline {
	// MP4Box文件对象
	private mp4boxfile: ExtendedMP4BoxFile;
	// 转码器
	private transmuxer: Transmuxer;
	// 视频解码器
	private videoDecoder: VideoDecoder | null = null;
	// 视频轨道信息
	private videoTrack: MP4VideoTrack | null = null;
	// 当前处理位置
	private currentPosition = 0;
	// 已处理的样本数量
	private sampleCount = 0;
	// 解码得到的帧
	private frames: ClipFrame[] = [];
	// 解码完成的Promise
	private decodingPromise: Promise<ClipFrame[]>;
	// Promise解析函数
	private resolvePromise!: (frames: ClipFrame[]) => void;
	// Promise拒绝函数
	private rejectPromise!: (reason?: unknown) => void;
	// 配置选项
	private options: DecodePipelineOptions;
	// 错误标志
	private hasError = false;
	// 已经初始化完成
	private isInitialized = false;
	// 缓存待处理的数据块，确保有足够数据进行解码
	private dataBuffer: Uint8Array[] = [];
	// 累计缓存的字节数
	private bufferedBytes = 0;
	// 缓存阈值，达到此阈值后才开始处理数据
	private bufferThreshold = 64 * 1024; // 64KB

	/**
	 * 构造函数
	 * @param options 解码选项
	 */
	constructor(options: DecodePipelineOptions) {
		this.options = options;
		// @ts-ignore
		this.mp4boxfile = MP4Box.createFile();
		// @ts-ignore
		this.transmuxer = new Mux.mp4.Transmuxer();

		// 初始化解码Promise
		this.decodingPromise = new Promise<ClipFrame[]>((resolve, reject) => {
			this.resolvePromise = resolve;
			this.rejectPromise = reject;
		});

		// 设置事件处理器
		this.setupEventHandlers();
	}

	/**
	 * 设置事件处理器
	 */
	private setupEventHandlers(): void {
		let filePosition = 0;

		// 处理转码数据
		this.transmuxer.on("data", (segment: TransmuxSegment) => {
			try {
				if (this.hasError) return;

				// 创建一个新的ArrayBuffer来存储initSegment和data
				const initSegment = new Uint8Array(segment.initSegment);
				const data = new Uint8Array(segment.data);

				// 计算总长度并创建缓冲区
				const totalLength = initSegment.byteLength + data.byteLength;
				const buffer = new ArrayBuffer(totalLength);
				const uint8View = new Uint8Array(buffer);

				// 复制数据
				uint8View.set(initSegment, 0);
				uint8View.set(data, initSegment.byteLength);

				// 设置fileStart属性
				const arrayBuffer = uint8View.buffer;
				// @ts-ignore
				arrayBuffer.fileStart = filePosition;

				// 将数据添加到MP4Box
				this.mp4boxfile.appendBuffer(arrayBuffer);

				// 更新位置
				filePosition += totalLength;

				// 处理完一个块后刷新MP4Box
				this.mp4boxfile.flush();
			} catch (error) {
				console.error("处理转码数据出错:", error);
				this.hasError = true;
				this.rejectPromise(error);
			}
		});

		// 转码完成事件
		this.transmuxer.on("done", () => {
			// 如果moov存在但尚未初始化，尝试再次刷新
			if (this.mp4boxfile.moov && !this.isInitialized) {
				this.mp4boxfile.flush();
			}
		});

		// 错误处理
		this.transmuxer.on("error", (error: unknown) => {
			console.error("转码器错误:", error);
			this.hasError = true;
			this.rejectPromise(error);
		});

		// MP4文件就绪事件
		this.mp4boxfile.onReady = (info: MP4Info) => {
			this.isInitialized = true;

			if (!info.videoTracks || info.videoTracks.length === 0) {
				console.error("无视频轨道");
				this.hasError = true;
				this.rejectPromise(new Error("无视频轨道"));
				return;
			}

			this.videoTrack = info.videoTracks[0];

			if (this.videoTrack) {
				this.mp4boxfile.setExtractionOptions(this.videoTrack.id, "video", {
					nbSamples: Infinity,
				});

				const { width, height } = this.calcClipSize(
					this.videoTrack.track_width,
					this.videoTrack.track_height,
					this.options.maxWidth,
					this.options.maxHeight,
				);

				this.setupVideoDecoder(width, height);
				this.mp4boxfile.start();
			}
		};

		// 样本处理事件
		this.mp4boxfile.onSamples = (
			trackId: number,
			_: unknown,
			samples: MP4Sample[],
		) => {
			if (this.hasError) return;

			// 如果已经达到需要的样本数量，不再处理新样本
			if (this.sampleCount >= this.options.nbSamples) {
				return;
			}

			if (this.videoTrack?.id === trackId) {
				if (!this.videoDecoder || this.videoDecoder.state === "closed") {
					console.error("视频解码器未就绪或已关闭");
					return;
				}

				// 确保样本按DTS（解码时间戳）排序
				const sortedSamples = [...samples].sort((a, b) => a.dts - b.dts);

				// 查找第一个关键帧
				const firstKeyFrameIndex = sortedSamples.findIndex(
					(sample) => sample.is_sync,
				);
				if (firstKeyFrameIndex > 0) {
					// 从第一个关键帧开始处理
					sortedSamples.splice(0, firstKeyFrameIndex);
				}

				if (sortedSamples.length === 0) {
					return;
				}

				// 规范化时间戳，确保从0开始
				const baseTime = sortedSamples[0].dts;

				// 计算需要解码的样本数量，避免过度解码
				// 保留一些余量，解码比请求多50%的帧，确保有足够的帧可选择
				const maxSamplesToProcess = Math.min(
					sortedSamples.length,
					Math.ceil(this.options.nbSamples * 1.5) - this.sampleCount,
				);

				// 只处理必要数量的样本
				for (let i = 0; i < maxSamplesToProcess; i++) {
					// 再次检查是否已达到目标
					if (this.sampleCount >= this.options.nbSamples) {
						break;
					}

					const sample = sortedSamples[i];
					const isKeyFrame = sample.is_sync;

					// 计算相对时间戳，避免大数值
					const normalizedDts = sample.dts - baseTime;
					// 使用相对时间戳，并确保时间单位正确
					const timestamp =
						(normalizedDts * 1000000) / this.videoTrack.timescale;
					// 确保持续时间不为0
					const duration = Math.max(
						(sample.duration * 1000000) / this.videoTrack.timescale,
						1,
					);

					try {
						const chunk = new EncodedVideoChunk({
							type: isKeyFrame ? "key" : "delta",
							timestamp: Math.round(timestamp), // 取整避免精度问题
							duration: Math.round(duration), // 取整避免精度问题
							data: sample.data,
						});

						if (this.videoDecoder && this.videoDecoder.state === "configured") {
							this.videoDecoder.decode(chunk);
						}
					} catch (error) {
						console.error(`处理样本 ${i} 失败:`, error);
						// 如果是第一个关键帧失败，则整个解码过程可能失败
						if (i === 0 && isKeyFrame) {
							this.hasError = true;
							this.rejectPromise(new Error(`处理关键帧失败: ${error}`));
							return;
						}
					}
				}

				// 只有当确实处理了一些样本，且视频解码器仍然有效时才进行flush
				if (
					maxSamplesToProcess > 0 &&
					this.videoDecoder &&
					this.videoDecoder.state === "configured"
				) {
					// 使用安全的方式调用flush
					try {
						this.videoDecoder.flush().catch((err) => {
							console.error("解码器flush失败:", err);
						});
					} catch (error) {
						console.error("调用flush时发生错误:", error);
					}
				}
			}
		};
	}

	/**
	 * 设置视频解码器
	 */
	private setupVideoDecoder(width: number, height: number): void {
		if (!this.videoTrack) {
			console.error("没有视频轨道");
			return;
		}

		// 确保之前的解码器已关闭
		if (this.videoDecoder) {
			try {
				this.videoDecoder.close();
			} catch (e) {
				console.error("关闭之前的解码器失败:", e);
			}
			this.videoDecoder = null;
		}

		try {
			// 标准化编解码器字符串
			let codec = this.videoTrack.codec;

			// 确保H.264编解码器使用更通用的配置
			if (codec.startsWith("avc1")) {
				// 使用基本配置文件
				codec = "avc1.42001f";
			}

			// 获取额外的配置数据
			const description = this.getExtradata();
			if (!description) {
				throw new Error("无法获取解码器配置数据");
			}

			this.videoDecoder = new VideoDecoder({
				output: async (videoFrame) => {
					try {
						// 如果已经达到了要求的样本数，就跳过处理这个帧
						if (this.sampleCount >= this.options.nbSamples) {
							videoFrame.close();
							return;
						}

						const img = await createImageBitmap(videoFrame, {
							resizeQuality: "pixelated",
							premultiplyAlpha: "none",
							resizeWidth: width,
							resizeHeight: height,
						});

						const frame = {
							img,
							duration: videoFrame.duration,
							timestamp: videoFrame.timestamp / 1000000,
						};

						this.sampleCount++;
						this.frames.push(frame);

						if (this.sampleCount >= this.options.nbSamples) {
							// 先保存帧结果
							const result = [...this.frames];

							// 尝试安全关闭解码器
							try {
								if (this.videoDecoder) {
									// 避免再次flush，直接关闭解码器
									this.videoDecoder.close();
									this.videoDecoder = null;
								}
							} catch (e) {
								console.error("关闭解码器失败:", e);
							}

							// 然后解析Promise
							this.resolvePromise(result);
						}
						videoFrame.close();
					} catch (error) {
						console.error("处理视频帧错误:", error);
						videoFrame.close();
					}
				},
				error: (error: unknown) => {
					console.error("视频解码器错误:", error);
					this.hasError = true;
					this.rejectPromise(new Error(`视频解码错误: ${error}`));
				},
			});

			// 使用更保守的配置
			this.videoDecoder.configure({
				codec: codec,
				codedWidth: this.videoTrack.track_width,
				codedHeight: this.videoTrack.track_height,
				// 尝试软件解码
				hardwareAcceleration: "prefer-software",
				// 关闭低延迟优化，提高兼容性
				optimizeForLatency: false,
				description: description,
			});
		} catch (error) {
			console.error("设置视频解码器失败:", error);
			this.hasError = true;
			this.rejectPromise(error);
		}
	}

	/**
	 * 计算缩略图大小
	 */
	private calcClipSize(
		width: number,
		height: number,
		maxWidth: number,
		maxHeight: number,
	) {
		const scale = Math.min(maxWidth / width, maxHeight / height);
		return {
			width: Math.floor(width * scale),
			height: Math.floor(height * scale),
		};
	}

	/**
	 * 获取解码器所需的额外数据
	 */
	private getExtradata(): Uint8Array | null {
		try {
			// 检查moov是否存在
			if (!this.mp4boxfile.moov) {
				return null;
			}

			// 获取第一个轨道
			const trak = this.mp4boxfile.moov.traks[0];
			if (
				!trak ||
				!trak.mdia ||
				!trak.mdia.minf ||
				!trak.mdia.minf.stbl ||
				!trak.mdia.minf.stbl.stsd
			) {
				return null;
			}

			const entries = trak.mdia.minf.stbl.stsd.entries;
			if (!entries || entries.length === 0) {
				return null;
			}

			// 获取轨道的编解码信息
			const entry = entries[0];
			const box = entry.avcC ?? entry.hvcC ?? entry.vpcC;

			if (!box) {
				return null;
			}

			// 将编解码信息写入缓冲区
			const buffer = new ArrayBuffer(1024);
			// @ts-ignore
			const stream = new DataStream(buffer, 0, DataStream.BIG_ENDIAN);
			// @ts-ignore
			box.write(stream);

			// 从缓冲区中提取出编解码器额外数据
			return new Uint8Array(stream.buffer, 8, stream.position - 8);
		} catch (error) {
			console.error("获取额外数据错误:", error);
			return null;
		}
	}

	/**
	 * 推送数据到管道进行处理
	 * @param data 要处理的数据
	 */
	public pushData(data: Uint8Array): void {
		if (this.hasError) {
			return;
		}

		try {
			// 将数据添加到缓冲区
			this.dataBuffer.push(data);
			this.bufferedBytes += data.byteLength;

			// 只有当累积足够数据时才处理
			if (this.bufferedBytes >= this.bufferThreshold || this.isInitialized) {
				// 合并所有数据块
				const mergedData = new Uint8Array(this.bufferedBytes);
				let offset = 0;
				for (const chunk of this.dataBuffer) {
					mergedData.set(chunk, offset);
					offset += chunk.byteLength;
				}

				// 清空缓冲区
				this.dataBuffer = [];
				this.bufferedBytes = 0;

				// 推送到转码器
				this.transmuxer.push(mergedData);
				this.transmuxer.flush();
			}
		} catch (error) {
			console.error("推送数据错误:", error);
			this.hasError = true;
			this.rejectPromise(error);
		}
	}

	/**
	 * 设置当前处理位置
	 * @param position 处理位置
	 */
	public setPosition(position: number): void {
		this.currentPosition = position;
	}

	/**
	 * 获取解码完成的Promise
	 */
	public getPromise(): Promise<ClipFrame[]> {
		return this.decodingPromise;
	}

	/**
	 * 获取已解码的帧
	 */
	public getFrames(): ClipFrame[] {
		return this.frames;
	}

	/**
	 * 销毁管道，释放资源
	 */
	public destroy(): void {
		// 清空数据缓冲区
		this.dataBuffer = [];
		this.bufferedBytes = 0;
		this.frames = [];

		// 关闭视频解码器
		if (this.videoDecoder) {
			try {
				this.videoDecoder.close();
			} catch (e) {
				console.error("关闭视频解码器错误:", e);
			}
			this.videoDecoder = null;
		}

		// 停止MP4Box
		try {
			this.mp4boxfile.stop();
		} catch (e) {
			console.error("停止MP4Box失败:", e);
		}

		// 释放资源
		// @ts-ignore - 允许将引用设置为null以释放内存
		this.mp4boxfile = null;
		// @ts-ignore - 允许将引用设置为null以释放内存
		this.transmuxer = null;
	}
}
