import { useEventListener } from "@vueuse/core";
import type { PlayerContext } from "./usePlayerProvide";

export function useHotKey(ctx: PlayerContext) {
	// 热键处理
	const handleKeydown = (event: KeyboardEvent) => {
		// 忽略输入框的按键事件
		if (
			event.target instanceof HTMLInputElement ||
			event.target instanceof HTMLTextAreaElement
		) {
			return;
		}

		switch (event.code) {
			// 空格键
			case "Space":
				event.preventDefault();
				ctx.playing?.togglePlay();
				break;
			// 左箭头
			case "ArrowLeft":
				event.preventDefault();
				ctx.progress?.skip(-5);
				break;
			// 右箭头
			case "ArrowRight":
				event.preventDefault();
				ctx.progress?.skip(5);
				break;
			// 上箭头
			case "ArrowUp":
				event.preventDefault();
				ctx.volume?.adjustVolume(5);
				break;
			// 下箭头
			case "ArrowDown":
				event.preventDefault();
				ctx.volume?.adjustVolume(-5);
				break;
		}
	};

	useEventListener("keydown", handleKeydown);
}
