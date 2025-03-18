import { type Ref, computed } from "vue";
import { usePreferences } from "./usePreferences";

export const usePlaybackRate = (
	videoElementRef: Ref<HTMLVideoElement | null>,
) => {
	const { preferences } = usePreferences();
	// 播放速度
	const playbackRate = computed(() => preferences.value.playbackRate);
	// 设置播放速度
	const setPlaybackRate = (rate: number) => {
		if (!videoElementRef.value) return;
		videoElementRef.value.playbackRate = rate;
		preferences.value.playbackRate = rate;
	};

	return {
		playbackRate,
		setPlaybackRate,
	};
};
