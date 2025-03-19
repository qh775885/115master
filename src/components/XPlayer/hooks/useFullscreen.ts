import { useEventListener, useVModel } from "@vueuse/core";
import { shallowRef } from "vue";
import type { PlayerContext } from "./usePlayerProvide";

// 全屏和剧院模式
export function useFullscreen(ctx: PlayerContext) {
	// 是否全屏
	const isFullscreen = shallowRef(false);
	// 剧院模式
	const theatre = useVModel(ctx.rootProps, "theatre", ctx.rootEmit);

	// 监听全屏变化
	const handleFullscreenChange = () => {
		isFullscreen.value = !!document.fullscreenElement;
	};

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

	// 剧院模式
	const toggleTheatre = async () => {
		theatre.value = !theatre.value;
	};

	useEventListener(document, "fullscreenchange", handleFullscreenChange);
	useEventListener(document, "webkitfullscreenchange", handleFullscreenChange);
	useEventListener(document, "mozfullscreenchange", handleFullscreenChange);
	useEventListener(document, "MSFullscreenChange", handleFullscreenChange);

	return {
		theatre,
		isFullscreen,
		toggleFullscreen,
		toggleTheatre,
	};
}
