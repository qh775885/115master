import { type Ref, computed } from "vue";
import { usePreferences } from "./usePreferences";

export const useVolume = (videoElementRef: Ref<HTMLVideoElement | null>) => {
	const { preferences } = usePreferences();

	// 音量控制
	const setVolume = (value: number) => {
		if (!videoElementRef.value) return;
		videoElementRef.value.volume = value / 100;
		preferences.value.volume = value;
		preferences.value.muted = value === 0;
	};

	// 静音控制
	const toggleMute = () => {
		if (!videoElementRef.value) return;
		videoElementRef.value.muted = !videoElementRef.value.muted;
		preferences.value.muted = videoElementRef.value.muted;
	};

	// 调整音量
	const adjustVolume = (delta: number) => {
		if (!videoElementRef.value) return;
		const newVolume = Math.min(
			Math.max(0, preferences.value.volume + delta),
			100,
		);
		setVolume(newVolume);
	};

	return {
		volume: computed(() => preferences.value.volume),
		isMuted: computed(() => preferences.value.muted),
		setVolume,
		toggleMute,
		adjustVolume,
	};
};
