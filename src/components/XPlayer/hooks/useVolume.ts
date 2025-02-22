import { type Ref, ref } from "vue";

export const useVolume = (videoElementRef: Ref<HTMLVideoElement | null>) => {
	const volume = ref(100);
	const isMuted = ref(false);

	// 音量控制
	const setVolume = (value: number) => {
		if (!videoElementRef.value) return;
		videoElementRef.value.volume = value / 100;
		volume.value = value;
		isMuted.value = value === 0;
	};

	// 静音控制
	const toggleMute = () => {
		if (!videoElementRef.value) return;
		videoElementRef.value.muted = !videoElementRef.value.muted;
		isMuted.value = videoElementRef.value.muted;
		if (videoElementRef.value.muted) {
			volume.value = 0;
		} else {
			volume.value = videoElementRef.value.volume * 100;
		}
	};

	// 调整音量
	const adjustVolume = (delta: number) => {
		if (!videoElementRef.value) return;
		const newVolume = Math.min(Math.max(0, volume.value + delta), 100);
		setVolume(newVolume);
	};

	return {
		volume,
		isMuted,
		setVolume,
		toggleMute,
		adjustVolume,
	};
};
