// HUD消息数据
export type HudMessageProgress = {
	max?: number; // 最大值（用于进度条）
	min?: number; // 最小值（用于进度条）
	value?: number; // 当前进度（用于进度条显示）
};

// HUD消息
export type HudMessage = {
	title?: string; // 标题
	value?: number | string | boolean; // 值
	icon?: string; // 图标
	iconClass?: string; // 图标类名
	progress?: HudMessageProgress; // 数据
	duration?: number; // 持续时间（毫秒）, 默认1500ms
	timestamp: number; // 时间戳
};
