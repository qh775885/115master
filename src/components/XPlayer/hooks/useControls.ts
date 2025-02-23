import { ref } from "vue";

export const useControls = () => {
	// 控制栏是否显示
	const visible = ref(true);
	// 鼠标是否在控制栏
	const isMouseInControls = ref(false);
	// 鼠标是否在菜单栏
	const isMouseInMenu = ref(false);
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

	const show = () => {
		visible.value = true;
	};

	const hide = () => {
		visible.value = false;
	};

	const clearHideControlsTimer = () => {
		if (hideControlsTimer) {
			clearTimeout(hideControlsTimer);
			hideControlsTimer = null;
		}
	};

	const showWithAutoHide = () => {
		show();
		hideWithDelay();
	};

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
