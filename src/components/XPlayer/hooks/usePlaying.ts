import { useEventListener } from "@vueuse/core";
import { shallowRef } from "vue";
import type { PlayerContext } from "./usePlayerProvide";

// 播放状态
export const usePlaying = (ctx: PlayerContext) => {
	// 视频元素
	const videoElementRef = ctx.refs.videoElementRef;
	// 是否播放
	const isPlaying = shallowRef(false);
	// 是否自动播放
	const autoplay = shallowRef(true);
	// 是否循环
	const loop = shallowRef(false);
	// 是否加载中
	const isLoading = shallowRef(false);

	// 更新播放状态
	const updatePlayingState = () => {
		if (!videoElementRef.value) return;
		isPlaying.value = !videoElementRef.value.paused;
	};

	// 播放控制
	const togglePlay = async () => {
		if (!videoElementRef.value) return;
		try {
			if (videoElementRef.value.paused) {
				await videoElementRef.value.play();
			} else {
				videoElementRef.value.pause();
			}
		} catch (error) {
			console.error("Failed to toggle play state:", error);
		}
	};

	// 显示加载状态
	const showLoading = () => {
		isLoading.value = true;
	};

	// 取消加载状态
	const cancelLoading = () => {
		isLoading.value = false;
	};

	useEventListener(videoElementRef, "play", updatePlayingState);
	useEventListener(videoElementRef, "pause", updatePlayingState);
	useEventListener(videoElementRef, "playing", updatePlayingState);
	useEventListener(videoElementRef, "ended", updatePlayingState);
	useEventListener(videoElementRef, "waiting", showLoading);
	useEventListener(videoElementRef, "canplay", cancelLoading);

	return {
		loop,
		autoplay,
		isPlaying,
		isLoading,
		togglePlay,
	};
};
