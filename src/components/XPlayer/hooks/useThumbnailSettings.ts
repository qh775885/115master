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

	// 设置采样间隔
	const setSamplingInterval = (interval: number) => {
		if (preferences.thumbnailsSamplingInterval !== interval) {
			preferences.thumbnailsSamplingInterval = interval;
		}
	};

	return {
		// 状态
		autoLoadThumbnails: toRef(preferences, "autoLoadThumbnails"),
		samplingInterval: toRef(preferences, "thumbnailsSamplingInterval"),
		// 方法
		toggleAutoLoad,
		setSamplingInterval,
	};
};
