import { type Ref, ref } from "vue";

export const usePlaybackRate = (
	videoElementRef: Ref<HTMLVideoElement | null>,
) => {
	// 播放速度
	const playbackRate = ref(1);
	// 设置播放速度
	const setPlaybackRate = (rate: number) => {
		if (!videoElementRef.value) return;
		videoElementRef.value.playbackRate = rate;
		playbackRate.value = rate;
	};

	return {
		playbackRate,
		setPlaybackRate,
	};
};
