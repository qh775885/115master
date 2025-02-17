import { ref } from "vue";

export const useControls = () => {
	const visible = ref(true);
	// 隐藏控制栏计时器
	let hideControlsTimer: number | null = null;

	// 控制栏显示/隐藏控制
	const showControls = () => {
		if (hideControlsTimer) {
			clearTimeout(hideControlsTimer);
			hideControlsTimer = null;
		}
		visible.value = true;
		hideControlsTimer = window.setTimeout(() => {
			visible.value = false;
		}, 1000);
	};

	// 隐藏控制栏
	const hideControls = () => {
		if (hideControlsTimer) {
			clearTimeout(hideControlsTimer);
		}
		hideControlsTimer = window.setTimeout(() => {
			visible.value = false;
		}, 1000);
	};

	return {
		visible,
		showControls,
		hideControls,
	};
};
