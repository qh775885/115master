import type Hls from "hls.js";

// window 下 添加 Hls 类型
declare global {
	interface Window {
		Hls: typeof Hls; // 简化类型声明
	}
}
