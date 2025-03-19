import { useVModel } from "@vueuse/core";
import type { PlayerContext } from "./usePlayerProvide";

// 音量
export const useVolume = (context: PlayerContext) => {
	const videoElementRef = context.refs.videoElementRef;

	// 音量
	const volume = useVModel(context.rootProps, "volume", context.rootEmit);

	// 静音
	const muted = useVModel(context.rootProps, "muted", context.rootEmit);

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
