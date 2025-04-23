import EventEmitter from "eventemitter3";
// @ts-ignore
import MP4Box, { DataStream } from "mp4box";
import Mux from "mux.js";
import type {
	MP4BoxFile,
	MP4Info,
	MP4Sample,
	MP4VideoTrack,
} from "../../types/mp4box";
import { promiseWithTimeout } from "../promise";

// 转码器段数据类型
type TransmuxSegment = {
	initSegment: Uint8Array;
	data: Uint8Array;
	captions?: unknown;
	metadata?: unknown;
};

// Mux.js 转码器类型
interface Transmuxer {
	on(event: "data", callback: (data: TransmuxSegment) => void): void;
	on(event: "done", callback: () => void): void;
	on(event: "error", callback: (error: unknown) => void): void;
	on(event: string, callback: (data: unknown) => void): void;
	push(data: Uint8Array): void;
	flush(): void;
}

type DemuxerTsOptions = {
	baseMediaDecodeTime?: number;
	onConfig: (config: VideoDecoderConfig) => void;
	onSamples: (_trackId: number, _user: unknown, samples: MP4Sample[]) => void;
	onError?: (error: unknown) => void;
};

const noop = () => {};

/**
 * 负责将TS流解复用为MP4文件
 */
export class DemuxerTs extends EventEmitter {
	// MP4Box文件对象
	readonly mp4boxfile: MP4BoxFile;
	// 转码器
	readonly transmuxer: Transmuxer;
	// 视频轨道信息
	public videoTrack: MP4VideoTrack | null = null;
	// 文件位置
	protected filePosition = 0;
	// 配置事件
	protected onConfig: DemuxerTsOptions["onConfig"];
	// 错误事件
	protected onError: DemuxerTsOptions["onError"];
	// 样本事件
	protected onSamples: DemuxerTsOptions["onSamples"];

	/**
	 * 构造函数
	 * @param options 解码选项
	 */
	constructor(options: DemuxerTsOptions) {
		super();
		this.onConfig = options.onConfig;
		this.onSamples = options.onSamples;
		this.onError = options.onError ?? noop;
		this.mp4boxfile = MP4Box.createFile();
		this.transmuxer = new Mux.mp4.Transmuxer();
		this.mp4boxfile.onReady = this.mp4boxfileOnReady.bind(this);
		this.mp4boxfile.onSamples = this.mp4boxfileOnSamples.bind(this);
		this.transmuxer.on("data", this.transmuxerOnData.bind(this));
		this.transmuxer.on("done", this.transmuxerOnDone.bind(this));
		this.transmuxer.on("error", this.transmuxerOnError.bind(this));
	}

	/**
	 * 推入数据
	 * @param buffer 数据
	 * @returns Promise<boolean> 是否需要更多数据
	 */
	public push(buffer: ArrayBuffer): Promise<boolean> {
		const promise = () =>
			new Promise<boolean>((resolve) => {
				this.transmuxer.on("done", () => {
					resolve(false);
				});
				this.transmuxer.push(new Uint8Array(buffer));
				this.transmuxer.flush();
			});
		return promiseWithTimeout(promise, 100).catch(() => {
			return true;
		});
	}

	/**
	 * MP4Box文件准备就绪
	 * @param info MP4信息
	 */
	private mp4boxfileOnReady(info: MP4Info): void {
		// 获取视频轨道
		this.videoTrack = info.videoTracks[0];
		if (!this.videoTrack) {
			this.emit("error", new Error("无视频轨道"));
			return;
		}

		// 设置提取选项
		this.mp4boxfile.setExtractionOptions(this.videoTrack.id, "video", {
			nbSamples: 10,
			rapAlignement: true,
		});

		// 获取额外的配置数据
		const description = this.getDescription(this.videoTrack.id);
		if (!description) {
			throw new Error("无法获取解码器配置数据");
		}

		// 配置解码器
		this.onConfig({
			codec: this.videoTrack.codec,
			codedWidth: this.videoTrack.track_width,
			codedHeight: this.videoTrack.track_height,
			description: description,
		});

		// 开始解复用
		this.mp4boxfile.start();
	}

	/**
	 * MP4Box文件样本事件
	 * @param _trackId 轨道ID
	 * @param _user 用户 video, audio
	 * @param samples 样本
	 */
	private mp4boxfileOnSamples(
		_trackId: number,
		_user: unknown,
		samples: MP4Sample[],
	): void {
		this.onSamples(_trackId, _user, samples);
	}

	/**
	 * 转复用器数据事件
	 * @param segment 分片
	 */
	private transmuxerOnData(segment: TransmuxSegment): void {
		const hasMoov = this.mp4boxfile.moov;

		// 计算总长度并创建缓冲区
		let byteLength = 0;
		if (hasMoov) {
			byteLength = segment.data.byteLength;
		} else {
			byteLength = segment.initSegment.byteLength + segment.data.byteLength;
		}

		// 创建缓冲区
		const data = new Uint8Array(byteLength);

		if (hasMoov) {
			// 复制数据
			data.set(segment.data, 0);
		} else {
			data.set(segment.initSegment, 0);
			data.set(segment.data, segment.initSegment.byteLength);
		}

		// 转换为ArrayBuffer
		const buffer = new ArrayBuffer(data.byteLength);
		new Uint8Array(buffer).set(data);

		// 将数据添加到MP4Box
		// @ts-ignore see:https://gpac.github.io/mp4box.js/#appendbufferdata
		buffer.fileStart = this.filePosition;
		this.mp4boxfile.appendBuffer(buffer);

		// 更新位置
		this.filePosition += buffer.byteLength;

		// 处理完一个块后刷新MP4Box
		this.mp4boxfile.flush();
	}

	/**
	 * 转复用器错误事件
	 * @param error {unknown} 错误
	 */
	private transmuxerOnError(error: unknown): void {
		console.error("transmuxerOnError:", error);
		this.onError?.(error);
	}

	/**
	 * 转复用器完成事件
	 */
	private transmuxerOnDone(): void {
		this.emit("transmuxerDone");
	}

	/**
	 * 获取解码器所需的额外数据
	 * @param trackId {number} 轨道ID
	 * @returns 描述 - 用于解码器使用
	 */
	private getDescription(trackId: number) {
		const trak = this.mp4boxfile.getTrackById(trackId);
		for (const entry of trak.mdia.minf.stbl.stsd.entries) {
			const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;
			if (box) {
				const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
				box.write(stream);
				return new Uint8Array(stream.buffer, 8); // Remove the box header.
			}
		}
	}

	/**
	 * 销毁管道，释放资源
	 */
	public destroy(): void {
		// 停止MP4Box
		if (this.mp4boxfile?.moovStartFound) {
			this.mp4boxfile.stop();
		}

		// 释放资源
		// @ts-ignore - 允许将引用设置为null以释放内存
		this.mp4boxfile = null;
		// @ts-ignore - 允许将引用设置为null以释放内存
		this.transmuxer = null;
	}
}
