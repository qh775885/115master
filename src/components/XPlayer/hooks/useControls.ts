import { useEventListener } from "@vueuse/core";
import { computed, onUnmounted, shallowRef, watch } from "vue";
import type { PlayerContext } from "./usePlayerProvide";

// 控制栏
export const useControls = (ctx: PlayerContext) => {
	const mainRef = shallowRef<HTMLDivElement | null>(null);

	// 控制栏是否显示
	const visible = shallowRef(true);
	// 鼠标是否在控制栏
	const isMouseInControls = shallowRef(false);
	// 隐藏控制栏计时器
	let hideControlsTimer: number | null = null;
	// 控制栏高度
	const controlsMainHeight = computed(() => {
		return mainRef.value?.offsetHeight;
	});

	// 设置鼠标是否在控制栏
	const setIsMouseInControls = (value: boolean) => {
		isMouseInControls.value = value;
		if (value) {
			hideControlsTimer = null;
		}
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
			if (
				isMouseInControls.value ||
				ctx.progressBar?.isDragging.value ||
				ctx.popupManager?.hasOpenPopup.value
			) {
				return;
			}
			hide();
		}, 1000);
	};

	// 鼠标移动
	const handleRootMouseMove = () => {
		showWithAutoHide();
	};
	// 鼠标离开
	const handleRootMouseLeave = async () => {
		// 如果弹出层打开，则不隐藏控制栏
		if (ctx.popupManager?.hasOpenPopup.value) {
			return;
		}
		// 如果进度条正在拖动，则等待拖动结束再隐藏控制栏
		if (ctx.progressBar?.isDragging.value) {
			await ctx.progressBar?.waitDragEnd();
			return hideWithDelay();
		}
		clearHideControlsTimer();
		hide();
	};

	// 监听控制栏高度
	watch([visible, controlsMainHeight], () => {
		if (!ctx.cssVar) {
			return;
		}

		if (visible.value) {
			ctx.cssVar.safeAreaBottom.value = `${controlsMainHeight.value}px`;
		} else {
			ctx.cssVar.safeAreaBottom.value = "0px";
		}
	});

	// 监听
	useEventListener(ctx.refs.rootRef, "mousemove", handleRootMouseMove);
	useEventListener(ctx.refs.rootRef, "mouseleave", handleRootMouseLeave);

	onUnmounted(() => {
		clearHideControlsTimer();
	});

	return {
		visible,
		mainRef,
		setIsMouseInControls,
	};
};
