import { type Ref, onMounted, onUnmounted, ref, watch } from "vue";

export const usePlaying = (videoElementRef: Ref<HTMLVideoElement | null>) => {
	// 是否播放
	const isPlaying = ref(false);
	// 是否自动播放
	const autoplay = ref(false);
	// 是否循环
	const loop = ref(false);
	// 是否加载中
	const isLoading = ref(false);

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

	const showLoading = () => {
		isLoading.value = true;
	};

	const cancelLoading = () => {
		isLoading.value = false;
	};

	// 播放状态事件
	watch(videoElementRef, () => {
		if (!videoElementRef.value) return;
		showLoading();
		videoElementRef.value.addEventListener("play", updatePlayingState);
		videoElementRef.value.addEventListener("pause", updatePlayingState);
		videoElementRef.value.addEventListener("playing", updatePlayingState);
		videoElementRef.value.addEventListener("ended", updatePlayingState);
		videoElementRef.value.addEventListener("waiting", showLoading);
		videoElementRef.value.addEventListener("canplay", cancelLoading);
	});

	// 清理事件监听
	onUnmounted(() => {
		if (!videoElementRef.value) return;
		videoElementRef.value.removeEventListener("play", updatePlayingState);
		videoElementRef.value.removeEventListener("pause", updatePlayingState);
		videoElementRef.value.removeEventListener("playing", updatePlayingState);
		videoElementRef.value.removeEventListener("ended", updatePlayingState);
		videoElementRef.value.removeEventListener("waiting", showLoading);
		videoElementRef.value.removeEventListener("canplay", cancelLoading);
	});

	return {
		loop,
		autoplay,
		isPlaying,
		isLoading,
		togglePlay,
	};
};
