<template>
	<Transition name="fade">
		<div 
			v-if="visible"
			class="play-animation"
		>
			<div class="play-animation-icon">
				<div class="icon-wrapper">
					<Icon :svg="isShowPause ? Pause : Play" size="50px" />
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup lang="ts">
import Pause from "@material-symbols/svg-400/rounded/pause.svg?component";
import Play from "@material-symbols/svg-400/rounded/play_arrow.svg?component";
import { computed, shallowRef, watch } from "vue";
import Icon from "../../../../components/Icon/index.vue";
import { usePlayerContext } from "../../hooks/usePlayerProvide";

const { playerCore } = usePlayerContext();
const visible = shallowRef(false);
const timer = shallowRef<number | null>(null);
const isShowPause = shallowRef(false);

const showAnimation = (paused: boolean) => {
	// 显示动画
	visible.value = true;
	isShowPause.value = paused;

	// 清除之前的定时器
	if (timer.value) {
		clearTimeout(timer.value);
	}

	// 设置新的定时器，800ms 后隐藏动画
	timer.value = window.setTimeout(() => {
		visible.value = false;
	}, 250);
};

const showPlayButton = () => {
	visible.value = true;
	isShowPause.value = false;
};

const hideButton = () => {
	visible.value = false;
};

watch(
	() => playerCore.value?.canplay,
	(value) => {
		if (value) {
			if (!playerCore?.value?.paused) {
				showAnimation(false);
				return;
			}
			showPlayButton();
			return;
		}

		hideButton();
	},
);

// 监听播放状态变化
watch(
	() => playerCore?.value?.paused,
	(value) => {
		if (!playerCore?.value?.canplay) {
			return;
		}
		showAnimation(value);
	},
);
</script>

<style scoped>
.play-animation {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 10;
	pointer-events: none;
}

.play-animation-icon {
	width: 80px;
	height: 80px;
	background-color: rgba(0, 0, 0, 0.6);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.icon-wrapper {
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
	transform: translate(-50%, -50%) scale(0.8);
}

.fade-enter-to,
.fade-leave-from {
	opacity: 1;
	transform: translate(-50%, -50%) scale(1);
}
</style> 