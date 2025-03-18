import { type EmitFn, type Ref, onUnmounted, shallowRef, watch } from "vue";
import type { XPlayerEmit } from "../types";

export const useProgress = (
	videoElementRef: Ref<HTMLVideoElement | null>,
	emit: EmitFn<XPlayerEmit>,
) => {
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
		emit("updateCurrentTime", {
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
		emit("updateCurrentTime", {
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

	// 快进快退
	const skip = (seconds: number) => {
		if (!videoElementRef.value) return;
		const newTime = currentTime.value + seconds;
		const clampedTime = Math.min(Math.max(0, newTime), duration.value);
		seekTo(clampedTime);
	};

	watch(videoElementRef, () => {
		if (!videoElementRef.value) return;
		videoElementRef.value.addEventListener("timeupdate", updateProgress);
		videoElementRef.value.addEventListener("loadedmetadata", updateProgress);
		videoElementRef.value.addEventListener("progress", updateBuffer);
	});

	onUnmounted(() => {
		if (!videoElementRef.value) return;
		videoElementRef.value.removeEventListener("timeupdate", updateProgress);
		videoElementRef.value.removeEventListener("loadedmetadata", updateProgress);
		videoElementRef.value.removeEventListener("progress", updateBuffer);
	});

	return {
		currentTime,
		duration,
		buffered,
		progress,
		seekTo,
		skip,
	};
};
