import { useEventListener } from "@vueuse/core";
import { shallowRef } from "vue";
import type { PlayerContext } from "./usePlayerProvide";

export const useProgress = (ctx: PlayerContext) => {
	// 视频元素
	const videoElementRef = ctx.refs.videoElementRef;
	// 当前时间
	const currentTime = shallowRef(0);
	// 总时长
	const duration = shallowRef(0);
	// 缓冲进度
	const buffered = shallowRef(0);
	// 进度
	const progress = shallowRef(0);

	// 跳转到指定时间
	const seekTo = (time: number) => {
		if (!videoElementRef.value) return;
		currentTime.value = time;
		progress.value = (time / duration.value) * 100;
		// 实际更新视频时间
		videoElementRef.value.currentTime = time;
		ctx.rootEmit("updateCurrentTime", {
			time,
			isManual: true,
		});
	};

	// 更新进度
	const updateProgress = () => {
		if (!videoElementRef.value) return;
		currentTime.value = videoElementRef.value.currentTime;
		duration.value = videoElementRef.value.duration;
		progress.value = (currentTime.value / duration.value) * 100;
		ctx.rootEmit("updateCurrentTime", {
			time: videoElementRef.value.currentTime,
			isManual: false,
		});
	};

	// 更新缓冲进度
	const updateBuffer = () => {
		if (!videoElementRef.value) return;
		const timeRanges = videoElementRef.value.buffered;
		if (timeRanges.length > 0) {
			buffered.value =
				(timeRanges.end(timeRanges.length - 1) /
					videoElementRef.value.duration) *
				100;
		}
	};

	// 快进快退 (秒数或百分比浮点数)
	const skip = (value: number, isPercent = false) => {
		if (!videoElementRef.value) return;
		const newTime = isPercent
			? value * duration.value
			: currentTime.value + value;
		const clampedTime = Math.min(Math.max(0, newTime), duration.value);
		seekTo(clampedTime);
	};

	useEventListener(videoElementRef, "timeupdate", updateProgress);
	useEventListener(videoElementRef, "loadedmetadata", updateProgress);
	useEventListener(videoElementRef, "progress", updateBuffer);

	return {
		currentTime,
		duration,
		buffered,
		progress,
		seekTo,
		skip,
	};
};
