import { useEventListener } from "@vueuse/core";
import { shallowRef } from "vue";
import type { PlayerContext } from "./usePlayerProvide";

/**
 * 全屏和播放列表
 */
export function useFullscreen(ctx: PlayerContext) {
	// 是否全屏
	const isFullscreen = shallowRef(false);
	// 显示播放列表
	const showPlaylist = ctx.rootPropsVm.showPlaylist;

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
				showPlaylist.value = false;
			} else {
				await document.exitFullscreen();
			}
		} catch (error) {
			console.error("Failed to toggle fullscreen:", error);
		}
	};

	// 播放列表
	const toggleShowSider = async () => {
		const newValue = !showPlaylist.value;
		showPlaylist.value = newValue;
	};

	useEventListener(document, "fullscreenchange", handleFullscreenChange);
	useEventListener(document, "webkitfullscreenchange", handleFullscreenChange);
	useEventListener(document, "mozfullscreenchange", handleFullscreenChange);
	useEventListener(document, "MSFullscreenChange", handleFullscreenChange);

	return {
		showPlaylist,
		isFullscreen,
		toggleFullscreen,
		toggleShowSider,
	};
}
