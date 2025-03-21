<template>
	<div class="playback-rate-button">
		<button 
			class="control-button"
			title="倍速 (↑/↓)"
			@click="toggleSpeedMenu"
		>
			{{ playbackRate.current.value }} X
		</button>
		<Transition name="fade">
			<div 
				v-if="isMenuVisible"
				class="playback-rate-menu"
				@mouseleave="hideMenu"
			>
				<div class="playback-rate-menu-items">
					<button
						v-for="rate in rateOptions"
						:key="rate"
						class="playback-rate-menu-item"
						:class="{ active: playbackRate.current.value === rate }"
						@click="handleSpeedChange(rate)"
					>
						{{ rate }}
					</button>
				</div>
			</div>
		</Transition>
	</div>
</template>

<script setup lang="ts">
import { computed, shallowRef } from "vue";
import { usePlayerContext } from "../../hooks/usePlayerProvide";
const { playbackRate } = usePlayerContext();
const rateOptions = computed(() => playbackRate.rateOptions.value.reverse());
const isMenuVisible = shallowRef(false);

// 切换菜单显示
const toggleSpeedMenu = () => {
	isMenuVisible.value = !isMenuVisible.value;
};

// 隐藏菜单
const hideMenu = () => {
	isMenuVisible.value = false;
};

// 处理倍速变化
const handleSpeedChange = (rate: number) => {
	playbackRate.set(rate);
	hideMenu();
};
</script>

<style scoped>
.playback-rate-button {
	position: relative;
}

.control-button {
	display: flex;
	align-items: center;
	gap: 4px;
	background: none;
	border: none;
	color: #fff;
	cursor: pointer;
	padding: 4px 8px;
	font-size: 13px;
	border-radius: 4px;
	transition: background-color 0.2s;
}

.control-button:hover {
	background-color: rgba(255, 255, 255, 0.1);
}

.playback-rate-menu {
	position: absolute;
	bottom: 100%;
	right: 0;
	margin-bottom: 8px;
	background-color: rgba(28, 28, 28, 0.9);
	border-radius: 4px;
	padding: 8px 0;
	min-width: 120px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.playback-rate-menu-items {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.playback-rate-menu-item {
	background: none;
	border: none;
	color: #fff;
	cursor: pointer;
	padding: 6px 16px;
	text-align: left;
	font-size: 13px;
	transition: background-color 0.2s;
	width: 100%;
}

.playback-rate-menu-item:hover {
	background-color: rgba(255, 255, 255, 0.1);
}

.playback-rate-menu-item.active {
	color: var(--x-player-controller-progress-bar-color);
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
	transform: translateY(4px);
}

.fade-enter-to,
.fade-leave-from {
	opacity: 1;
	transform: translateY(0);
}
</style> 