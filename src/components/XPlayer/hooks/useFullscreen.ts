import { useEventListener, useVModel } from "@vueuse/core";
import { type EmitFn, shallowRef } from "vue";
import type { XPlayerEmit, XPlayerProps } from "../types";

export function useFullscreen(props: XPlayerProps, emit: EmitFn<XPlayerEmit>) {
	const isFullscreen = shallowRef(false);
	const theatre = useVModel(props, "theatre", emit);

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
