import { shallowRef, watch } from "vue";
import type { PlayerContext } from "./usePlayerProvide";

/**
 * 进度条
 */
export const useProgressBar = (_ctx: PlayerContext) => {
	const isDragging = shallowRef(false);

	const waitDragEnd = (): Promise<boolean> => {
		return new Promise((resolve) => {
			const unwatch = watch(isDragging, (value) => {
				if (!value) {
					resolve(true);
					unwatch();
				}
			});
		});
	};

	return {
		isDragging,
		waitDragEnd,
	};
};
