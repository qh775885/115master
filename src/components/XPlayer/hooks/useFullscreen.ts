import { onMounted, onUnmounted, ref } from "vue";

export function useFullscreen() {
	const isFullscreen = ref(false);

	// 监听全屏变化
	const handleFullscreenChange = () => {
		isFullscreen.value = !!document.fullscreenElement;
	};

	onMounted(() => {
		// 添加全屏变化监听
		document.addEventListener("fullscreenchange", handleFullscreenChange);
		document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
		document.addEventListener("mozfullscreenchange", handleFullscreenChange);
		document.addEventListener("MSFullscreenChange", handleFullscreenChange);
	});

	onUnmounted(() => {
		document.removeEventListener("fullscreenchange", handleFullscreenChange);
		document.removeEventListener(
			"webkitfullscreenchange",
			handleFullscreenChange,
		);
		document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
		document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
	});

	// 全屏控制
	const toggleFullscreen = async () => {
		try {
			if (!document.fullscreenElement) {
				window.scrollTo(0, 0);
				await document.documentElement.requestFullscreen();
			} else {
				await document.exitFullscreen();
			}
		} catch (error) {
			console.error("Failed to toggle fullscreen:", error);
		}
	};

	return {
		isFullscreen,
		toggleFullscreen,
	};
}
