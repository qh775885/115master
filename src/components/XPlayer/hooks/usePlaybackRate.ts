import { useEventListener, useVModel } from "@vueuse/core";
import type { PlayerContext } from "./usePlayerProvide";

// 播放速度
export const usePlaybackRate = (ctx: PlayerContext) => {
	const videoElementRef = ctx.refs.videoElementRef;
	// 播放速度
	const playbackRate = useVModel(ctx.rootProps, "playbackRate", ctx.rootEmit);

	// 设置播放速度
	const setPlaybackRate = (rate: number) => {
		if (!videoElementRef.value) return;
		videoElementRef.value.playbackRate = rate;
		playbackRate.value = rate;
	};

	// 可以播放的时候刷新 playbackRate
	useEventListener(videoElementRef, "canplay", () => {
		if (!videoElementRef.value) return;
		videoElementRef.value.playbackRate = playbackRate.value;
	});

	return {
		playbackRate,
		setPlaybackRate,
	};
};
