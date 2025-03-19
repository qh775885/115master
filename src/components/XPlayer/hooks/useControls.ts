import { shallowRef } from "vue";
import type { PlayerContext } from "./usePlayerProvide";

// 控制栏
export const useControls = (_ctx: PlayerContext) => {
	// 控制栏是否显示
	const visible = shallowRef(true);
	// 鼠标是否在控制栏
	const isMouseInControls = shallowRef(false);
	// 鼠标是否在菜单栏
	const isMouseInMenu = shallowRef(false);
	// 隐藏控制栏计时器
	let hideControlsTimer: number | null = null;

	// 设置鼠标是否在控制栏
	const setIsMouseInControls = (value: boolean) => {
		isMouseInControls.value = value;
		if (value) {
			hideControlsTimer = null;
		}
	};

	// 设置鼠标是否在菜单栏
	const setIsMouseInMenu = (value: boolean) => {
		isMouseInMenu.value = value;
	};

	// 显示控制栏
	const show = () => {
		visible.value = true;
	};

	// 隐藏控制栏
	const hide = () => {
		visible.value = false;
	};

	// 清除隐藏控制栏计时器
	const clearHideControlsTimer = () => {
		if (hideControlsTimer) {
			clearTimeout(hideControlsTimer);
			hideControlsTimer = null;
		}
	};

	// 显示控制栏并延迟隐藏
	const showWithAutoHide = () => {
		show();
		hideWithDelay();
	};

	// 延迟隐藏控制栏
	const hideWithDelay = () => {
		clearHideControlsTimer();
		hideControlsTimer = window.setTimeout(() => {
			if (isMouseInControls.value || isMouseInMenu.value) {
				return;
			}
			hide();
		}, 1000);
	};

	return {
		visible,
		show,
		hide,
		showWithAutoHide,
		hideWithDelay,
		clearHideControlsTimer,
		setIsMouseInControls,
		setIsMouseInMenu,
	};
};
