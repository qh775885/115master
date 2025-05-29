import { type Segment as M3U8Segment, Parser } from "m3u8-parser";
import type { Range } from "./IO";

type FetchInfo = {
	url: string;
	headers?: Record<string, string>;
	fetchOptions?: RequestInit;
};

export type Segment = M3U8Segment & {
	url: string;
	timestamp: number;
};

/**
 * HlsIO 类 - 负责从URL获取指定范围的视频数据
 * 处理数据块的读取和管理
 */
export class HlsIO {
	// 请求信息
	public info: FetchInfo | undefined;

	// 当前分片索引
	public segmentIndex = 0;

	// 分片列表
	public segments: Segment[] = [];

	// 总时长
	public duration = 0;

	// 当前分片
	get segment() {
		return this.segments[this.segmentIndex];
	}

	// 当前分片URL
	get segmentUrl() {
		if (!this.info) {
			throw new Error("info is undefined");
		}
		return new URL(this.segment.uri, this.info.url).href;
	}

	/**
	 * 获取主播放列表
	 */
	private async fetchMasterPlaylist(): Promise<void> {
		if (!this.info) {
			throw new Error("info is undefined");
		}
		const response = await fetch(this.info.url, {
			headers: this.info.headers,
		});
		const m3u8Text = await response.text();
		const parser = new Parser({
			url: this.info.url,
		});
		parser.push(m3u8Text);
		parser.end();
		let start = 0;
		this.segments = parser.manifest.segments.map((segment) => {
			const timestamp = start;
			start += segment.duration;
			return {
				...segment,
				duration: segment.duration,
				timestamp,
				url: new URL(segment.uri, this.info?.url).href,
			};
		});
		this.duration = start;
		console.log("segments", this.segments);
	}

	/**
	 * 打开
	 * @param info 请求信息
	 */
	public async open(info: FetchInfo): Promise<void> {
		this.info = info;
		await this.fetchMasterPlaylist();
	}

	/**
	 * 读取
	 * @param range 范围
	 * @returns 获取到的ArrayBuffer
	 */
	public async read(range: Range): Promise<ArrayBuffer> {
		const response = await fetch(this.segments[this.segmentIndex].uri, {
			headers: {
				Range: `bytes=${range.start}-${range.end}`,
			},
			...(this.info?.fetchOptions ?? {}),
		});
		return await response.arrayBuffer();
	}

	/**
	 * 跳转
	 * @param time 时间
	 * @returns 跳转到的分片
	 */
	public async seek(time: number): Promise<Segment> {
		this.segmentIndex = this.segments.findIndex(
			(i) => i.timestamp <= time && time <= i.timestamp + i.duration,
		);
		if (this.segmentIndex === -1) {
			throw new Error("时间超出范围");
		}
		return this.segment;
	}

	destroy() {
		this.segments = [];
		this.segmentIndex = 0;
		this.duration = 0;
		this.info = undefined;
	}
}
