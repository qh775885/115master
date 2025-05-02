/**
 * 播放器核心类型
 */
export enum PlayerCoreType {
	// 原生
	Native = "Native",
	// AvPlayer
	AvPlayer = "AvPlayer Beta",
	// hls.js
	Hls = "HLS.js",
}

/**
 * 播放器核心状态
 */
export type PlayerCoreState = {
	// 当前时间
	currentTime: number;
	// 总时间
	duration: number;
	// 当前播放状态
	paused: boolean;
	// 播放器速率
	playbackRate: number;
	// 播放器音量
	volume: number;
	// 是否静音
	muted: boolean;
	// 是否自动播放
	autoPlay: boolean;
	// 是否加载中
	isLoading: boolean;
	// 是否可以播放
	canplay: boolean;
	// 加载错误
	loadError: string | Error | unknown;
};

/**
 * 播放器核心事件
 */
export type PlayerCoreEvents = {
	// 可以播放
	canplay: () => void;
	// 时间更新
	timeupdate: (time: number) => void;
	// 正在跳转
	seeking: () => void;
	// 跳转完成
	seeked: () => void;
};

/**
 * 播放器核心方法
 */
export type PlayerCoreMethods = {
	// 初始化
	init: (container: HTMLDivElement) => Promise<void>;
	// 加载
	load: (
		// 视频源
		url: string,
		// 上次播放时间
		lastTime?: number,
	) => Promise<void>;
	// 播放
	play: () => Promise<void>;
	// 暂停
	pause: () => Promise<void>;
	// 切换播放
	togglePlay: () => Promise<void>;
	// 播放器速率 (0.1-15)
	setPlaybackRate: (rate: number) => void;
	// 播放器音量 (0-100)
	setVolume: (volume: number) => void;
	// 设置静音
	setMute: (muted: boolean) => void;
	// 切换静音
	toggleMute: () => void;
	// 设置自动播放
	setAutoPlay: (autoPlay: boolean) => void;
	// 跳转 (秒)
	seek: (time: number) => Promise<void>;
	// 获取渲染元素
	getRenderElement: () => HTMLVideoElement | HTMLCanvasElement | null;
	// 销毁
	destroy: () => Promise<void>;
	// 事件监听
	on: (
		name: keyof PlayerCoreEvents,
		callback: PlayerCoreEvents[keyof PlayerCoreEvents],
	) => void;
	// 事件移除
	off: (
		name: keyof PlayerCoreEvents,
		callback: PlayerCoreEvents[keyof PlayerCoreEvents],
	) => void;
};
