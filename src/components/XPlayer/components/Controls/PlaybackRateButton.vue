<template>
	<div class="playback-rate-button">
		<button 
			ref="buttonRef"
			class="control-button"
			title="倍速 (↑/↓)"
			@click="toggleSpeedMenu"
		>
			{{ playbackRate.current.value }} X
		</button>
		<Menu
			v-model:visible="menuVisible"
			class="menu"
			:triggerRef="buttonRef"
			placement="top"
		>
			<div class="menu-items">
				<div
					v-for="rate in rateOptions"
					:key="rate"
					class="menu-item"
					:class="{ active: playbackRate.current.value === rate }"
					@click="handleSpeedChange(rate)"
				>
					{{ rate }}
				</div>
			</div>
		</Menu>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef } from "vue";
import { usePlayerContext } from "../../hooks/usePlayerProvide";
import Menu from "../Menu/index.vue";

const { playbackRate } = usePlayerContext();
const rateOptions = computed(() =>
	[...playbackRate.rateOptions.value].reverse(),
);
const menuVisible = shallowRef(false);
const buttonRef = ref<HTMLElement>();

// 切换菜单显示
const toggleSpeedMenu = () => {
	menuVisible.value = !menuVisible.value;
};

// 处理倍速变化
const handleSpeedChange = (rate: number) => {
	playbackRate.set(rate);
	menuVisible.value = false;
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
</style> 