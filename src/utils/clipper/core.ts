// @ts-ignore
import MP4Box, { DataStream } from "mp4box";
import { DecodePipeline } from "./DecodePipeline";
import { FetchIO } from "./FetchIO";

// 视频帧
export type ClipFrame = {
	// 图片 ImageBitMap
	img: ImageBitmap;
	// 帧时长
	duration: number | null;
	// 样本时间戳
	timestamp: number;
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
	// 最大读取步数
	maxSteps?: number;
};

/**
 * 视频缩略图生成器核心
 * 负责协调FetchIO和DecodePipeline，对外提供缩略图生成功能
 */
export class ClipperCore {
	private fetchIO: FetchIO;

	constructor(protected options: ClipperOptions) {
		this.fetchIO = new FetchIO();
	}

	/**
	 * 生成视频缩略图
	 * @param url 视频URL
	 * @param nbSamples 需要获取的帧数
	 * @returns 生成的视频帧数组
	 */
	public async generateClips(
		url: string,
		nbSamples: number,
	): Promise<ClipFrame[]> {
		// 创建解码管道
		const pipeline = new DecodePipeline({
			nbSamples,
			maxWidth: this.options.maxWidth,
			maxHeight: this.options.maxHeight,
		});

		try {
			// 定义数据处理回调
			const processChunk = async (
				buffer: ArrayBuffer,
				position: number,
			): Promise<boolean> => {
				// 设置当前位置
				pipeline.setPosition(position);
				// 推送数据到管道
				pipeline.pushData(new Uint8Array(buffer));

				// 检查是否已经有足够的帧
				const frames = pipeline.getFrames();
				if (frames.length >= nbSamples) {
					return false; // 停止继续获取数据
				}

				try {
					// 尝试等待一段时间看是否能解码出帧
					await Promise.race([
						pipeline.getPromise(),
						new Promise((_, reject) =>
							setTimeout(() => reject(new Error("Timeout")), 100),
						),
					]);
					return false; // 已经成功解码
				} catch (error: unknown) {
					// 检查错误是否有message属性
					if (error instanceof Error && error.message === "Timeout") {
						return true; // 继续获取更多数据
					}
					throw error; // 其他错误，抛出
				}
			};

			// 使用FetchIO流式获取数据
			await this.fetchIO.streamChunks(url, processChunk, {
				initialChunkSize: this.options.initialChunkSize,
				stepChunkSize: this.options.stepChunkSize,
				maxSteps: this.options.maxSteps,
			});

			// 处理完所有数据块后，如果仍未获得足够帧，返回当前获得的帧
			const frames = pipeline.getFrames();

			// 清理资源
			pipeline.destroy();

			return frames;
		} catch (error: unknown) {
			// 错误处理
			console.error("生成缩略图失败:", error);
			// 确保资源被清理
			pipeline.destroy();
			throw error;
		}
	}

	/**
	 * 处理单个视频片段
	 * 兼容旧API，直接使用新的流程处理
	 */
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
	}): Promise<ClipFrame[]> {
		// 创建新选项，确保使用传递的参数
		const optionsOverride: ClipperOptions = {
			...this.options,
			maxWidth: maxWidth || this.options.maxWidth,
			maxHeight: maxHeight || this.options.maxHeight,
		};

		// 创建临时核心实例处理
		const tempCore = new ClipperCore(optionsOverride);
		return await tempCore.generateClips(url, nbSamples);
	}
}
