import { toRef } from "vue";
import type { PlayerContext } from "./usePlayerProvide";

// 预览图设置
export const useThumbnailSettings = (ctx: PlayerContext) => {
	const preferences = ctx.rootProps.preferences;

	if (!preferences) {
		throw new Error("播放器的 preferences 配置不存在，请先配置");
	}

	// 切换自动加载预览图
	const toggleAutoLoad = () => {
		preferences.autoLoadThumbnails = !preferences.autoLoadThumbnails;
	};

	// 切换全量预览图缓冲
	const toggleSuperBuffer = () => {
		preferences.superAutoBuffer = !preferences.superAutoBuffer;
	};

	return {
		// 状态
		autoLoadThumbnails: toRef(preferences, "autoLoadThumbnails"),
		superAutoBuffer: toRef(preferences, "superAutoBuffer"),
		// 方法
		toggleAutoLoad,
		toggleSuperBuffer,
	};
};
