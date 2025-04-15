// HUD消息数据
export type HudMessageData = {
	value?: number | string | boolean; // 值
	icon?: string; // 图标
	max?: number; // 最大值（用于进度条）
	min?: number; // 最小值（用于进度条）
	progress?: number; // 当前进度（用于进度条显示）
};

// HUD消息
export type HudMessage = {
	title?: string; // 标题
	data: HudMessageData; // 数据
	duration?: number; // 持续时间（毫秒）, 默认1500ms
	timestamp: number; // 时间戳
};
