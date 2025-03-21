<template>
	<Teleport :to="portalContainer" :disabled="!portalContainer">
		<div 
			ref="popupRef"
			v-show="visibleModel"
			:class="$style['x-popup']"
			:style="style"
			v-bind="$attrs"
		>
			<div :class="$style['x-popup-bg']"></div>
			<div :class="$style['x-popup-content']">
				<slot></slot>
			</div>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { onClickOutside, useVModel } from "@vueuse/core";
import { computed, shallowRef, watch } from "vue";
import { usePlayerContext } from "../../hooks/usePlayerProvide";
import { usePortal } from "../../hooks/usePortal";

interface Props {
	// 是否显示
	visible: boolean;
	// 水平位置
	x?: number;
	// 垂直位置
	y?: number;
	// 触发元素
	triggerRef?: HTMLElement;
	// 位置
	placement?: "top" | "bottom";
	// 偏移量
	offset?: number;
	// 是否锁定控制栏（阻止自动隐藏）
	lockControls?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	x: 0,
	y: 0,
	lockControls: true,
});

const emit = defineEmits<{
	(e: "click"): void;
	(e: "mouseenter"): void;
	(e: "mouseleave"): void;
}>();

const { container } = usePortal();
const { controls, refs } = usePlayerContext();
// 是否显示
const visibleModel = useVModel(props, "visible", emit);
// 弹出层容器
const portalContainer = computed(() => container.value || "body");
// 弹出层元素
const popupRef = shallowRef<HTMLElement>();
// 强制更新
const forceUpdate = shallowRef(0);
// 位置
const position = computed(() => {
	if (props.x && props.y) {
		return {
			x: props.x,
			y: props.y,
		};
	}

	return triggerPositiong.value;
});

// 样式
const style = computed(() => ({
	left: `${position.value.x}px`,
	top: `${position.value.y}px`,
	position: container.value ? ("absolute" as const) : ("fixed" as const),
}));

// 触发元素位置
const triggerPositiong = computed(() => {
	forceUpdate.value; // 用于强制更新位置

	if (!props.triggerRef || !popupRef.value) return { x: 0, y: 0 };

	// 获取触发元素和菜单的尺寸
	const triggerRect = props.triggerRef.getBoundingClientRect();
	const menuRect = popupRef.value.getBoundingClientRect();

	// 获取播放器容器
	const playerContainer = props.triggerRef.closest(".x-player");
	if (!playerContainer) return { x: 0, y: 0 };

	const playerRect = playerContainer.getBoundingClientRect();

	// 计算触发元素相对于播放器的位置
	const triggerLeft = triggerRect.left - playerRect.left;
	const triggerWidth = triggerRect.width;
	const triggerTop = triggerRect.top - playerRect.top;
	const triggerBottom = triggerRect.bottom - playerRect.top;

	// 计算可用空间
	const spaceBelow = playerRect.height - triggerBottom;
	const spaceAbove = triggerTop;

	// 默认偏移量
	const offset = props.offset ?? 8;

	// 确定垂直位置
	let y: number;
	if (
		props.placement === "top" ||
		(props.placement !== "bottom" &&
			spaceBelow < menuRect.height &&
			spaceAbove >= menuRect.height)
	) {
		y = triggerTop - menuRect.height - offset;
	} else {
		y = triggerBottom + offset;
	}

	// 计算水平居中位置
	let x = triggerLeft + triggerWidth / 2 - menuRect.width / 2;

	// 确保菜单不会超出播放器左侧或右侧边界
	x = Math.max(16, x); // 左侧边界保留16px间距
	x = Math.min(x, playerRect.width - menuRect.width - 16); // 右侧边界保留16px间距

	return { x, y };
});

// 监听全屏状态变化
watch(visibleModel, (visible) => {
	if (visible) {
		// 给浏览器一点时间来完成 DOM 更新
		setTimeout(() => {
			forceUpdate.value++;
		}, 0);
	}

	// 只有当需要锁定控制栏时才设置
	if (props.lockControls) {
		controls.setIsMouseInPopup(visible);
	}
});

// 点击外部
onClickOutside(popupRef, (event) => {
	if (visibleModel.value) {
		if (props.triggerRef?.contains(event.target as Node)) {
			event.stopPropagation();
		}
		if (refs.videoMaskRef.value?.contains(event.target as Node)) {
			event.stopPropagation();
		}
		visibleModel.value = false;
	}
});
</script>

<style module>
.x-popup {
	--x-popup-bg-color: rgba(15, 15, 15, 0.8);
	--x-popup-bg-blur: 20px;
	--x-popup-bg-saturate: 180%;
	--x-popup-padding: 8px;
	--x-popup-border-radius: 16px;
	--x-popup-box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
	z-index: 9999;
	position: relative;
	padding: var(--x-popup-padding);
}

.x-popup-bg {
	position: absolute;
	inset: 0;
	background: var(--x-popup-bg-color);
	backdrop-filter: blur(var(--x-popup-bg-blur)) saturate(var(--x-popup-bg-saturate));
	box-shadow: var(--x-popup-box-shadow);
	border-radius: var(--x-popup-border-radius);
}

.x-popup-content {
	position: relative;
	z-index: 1;
}
</style> 