import type { Component, Ref } from "vue";

// HUD消息类型
export type HudMessageType =
	| "volume" // 音量相关
	| "mute" // 静音
	| "speed" // 播放速度
	| "fastForward" // 快进
	| "fastBackward" // 快退
	| "subtitle" // 字幕
	| "transform"; // 旋转/翻转

// HUD消息数据
export type HudMessageData = {
	value?: number | string | boolean; // 值
	icon?: string | Component; // 图标
	max?: number; // 最大值（用于进度条）
	min?: number; // 最小值（用于进度条）
	progress?: number; // 当前进度（用于进度条显示）
};

// HUD消息
export type HudMessage = {
	type: HudMessageType; // 类型
	title: string; // 标题
	data?: HudMessageData; // 数据
	duration?: number; // 持续时间（毫秒）, 默认1500ms
	timestamp: number; // 时间戳
};

// HUD上下文
export type HudContext = {
	messages: Ref<HudMessage[]>; // 消息队列
	show: (message: Omit<HudMessage, "timestamp">) => void; // 显示消息
	clear: () => void; // 清空消息
	showProgressJump: (digit: number) => void; // 显示进度跳转HUD
};
