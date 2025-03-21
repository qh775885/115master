import type { Ref } from "vue";

// 视频源
export interface VideoSource {
	// 名称
	name: string;
	// 地址
	url: string;
	// 海报
	poster?: string;
	// 类型
	type: "auto" | "hls" | "mp4"; // 明确定义支持的类型
	// 质量
	quality: number;
	// 显示的画质值（可选）
	displayQuality?: string | number;
	// hls 配置
	hlsConfig?: {
		// 自动开始加载
		autoStartLoad?: boolean;
		// 开始位置
		startPosition?: number;
		// 调试
		debug?: boolean;
		// 其他配置
		[key: string]: unknown;
	};
}

// 字幕
export interface Subtitle {
	// 字幕 id
	id: string;
	// 字幕 url
	url: string;
	// 字幕名称
	label: string;
	// 字幕语言
	srclang: string;
	// 字幕类型
	kind: "subtitles" | "captions";
	// 字幕默认
	default?: boolean;
}

export type XPlayerProps = {
	// 视频源
	sources: Ref<VideoSource[]>;
	// 剧院模式
	theatre: boolean;
	// 音量
	volume: number;
	// 静音
	muted: boolean;
	// 播放速率
	playbackRate: number;
	// 设置项
	preferences?: {
		autoLoadThumbnails: boolean;
		superAutoBuffer: boolean;
	};
	// 缩略图请求
	onThumbnailRequest?: ({
		type,
		time,
		isLast,
	}: {
		type: "Cache" | "Must";
		time: number;
		isLast: boolean;
	}) => Promise<ImageBitmap | null>;
	// 字幕
	subtitles: Ref<Subtitle[] | null>;
	// 字幕准备就绪
	subtitlesReady: Ref<boolean>;
	// 字幕加载中
	subtitlesLoading: Ref<boolean>;
	// 字幕改变
	onSubtitleChange?: (subtitle: Subtitle | null) => void;
};

export type XPlayerEmit = {
	// 更新当前时间
	updateCurrentTime: [
		{
			// 时间
			time: number;
			// 是否手动
			isManual: boolean;
		},
	];
	// 剧院模式
	"update:theatre": [boolean];
	// 音量
	"update:volume": [number];
	// 静音
	"update:muted": [boolean];
	// 播放速率
	"update:playbackRate": [number];
};
