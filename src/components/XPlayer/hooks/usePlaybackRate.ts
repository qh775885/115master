import { useEventListener, useVModel } from "@vueuse/core";
import type { EmitFn, Ref } from "vue";
import type { XPlayerEmit, XPlayerProps } from "../types";

export const usePlaybackRate = (
	videoElementRef: Ref<HTMLVideoElement | null>,
	rootProps: XPlayerProps,
	emit: EmitFn<XPlayerEmit>,
) => {
	// 播放速度
	const playbackRate = useVModel(rootProps, "playbackRate", emit);
	// 设置播放速度
	const setPlaybackRate = (rate: number) => {
		if (!videoElementRef.value) return;
		videoElementRef.value.playbackRate = rate;
		playbackRate.value = rate;
	};

	useEventListener(videoElementRef, "canplay", () => {
		if (!videoElementRef.value) return;
		videoElementRef.value.playbackRate = playbackRate.value;
	});

	return {
		playbackRate,
		setPlaybackRate,
	};
};
