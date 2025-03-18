import { useVModel } from "@vueuse/core";
import type { EmitFn, Ref } from "vue";
import type { XPlayerEmit, XPlayerProps } from "../types";

export const useVolume = (
	videoElementRef: Ref<HTMLVideoElement | null>,
	rootProps: XPlayerProps,
	emit: EmitFn<XPlayerEmit>,
) => {
	// 音量
	const volume = useVModel(rootProps, "volume", emit);
	// 静音
	const muted = useVModel(rootProps, "muted", emit);

	// 音量控制
	const setVolume = (value: number) => {
		if (!videoElementRef.value) return;
		videoElementRef.value.volume = value / 100;
		volume.value = value;
		muted.value = value === 0;
	};

	// 静音控制
	const toggleMute = () => {
		if (!videoElementRef.value) return;
		videoElementRef.value.muted = !videoElementRef.value.muted;
		muted.value = videoElementRef.value.muted;
	};

	// 调整音量
	const adjustVolume = (delta: number) => {
		if (!videoElementRef.value) return;
		const newVolume = Math.min(Math.max(0, volume.value + delta), 100);
		setVolume(newVolume);
	};

	return {
		volume,
		muted,
		setVolume,
		toggleMute,
		adjustVolume,
	};
};
