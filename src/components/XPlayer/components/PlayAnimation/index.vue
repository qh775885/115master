<template>
	<Transition name="fade">
		<div 
			v-if="visible"
			class="play-animation"
		>
			<div class="play-animation-icon">
				<div class="icon-wrapper">
					<Icon :svg="playing.isPlaying.value ? Play : Pause" size="50px" />
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup lang="ts">
import Pause from "@material-symbols/svg-400/rounded/pause.svg?component";
import Play from "@material-symbols/svg-400/rounded/play_arrow.svg?component";
import { ref, watch } from "vue";
import Icon from "../../../../components/Icon/index.vue";
import { usePlayerContext } from "../../hooks/usePlayer";

const { playing } = usePlayerContext();
const visible = ref(false);
const timer = ref<number | null>(null);

// 监听播放状态变化
watch(playing.isPlaying, (value) => {
	// 显示动画
	visible.value = true;

	// 清除之前的定时器
	if (timer.value) {
		clearTimeout(timer.value);
	}

	// 设置新的定时器，800ms 后隐藏动画
	timer.value = window.setTimeout(() => {
		visible.value = false;
	}, 300);
});
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