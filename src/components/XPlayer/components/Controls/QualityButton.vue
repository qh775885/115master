<template>
	<div 
		ref="buttonRef"
		class="quality-button"
		@click="toggleMenu"
	>
		<span>{{ currentQuality }}</span>
		
		<Menu
			:visible="menuVisible"
			:triggerRef="buttonRef"
			placement="top"
			@update:visible="handleMenuVisibleChange"
		>
			<div
				v-for="item in source.list.value"
				:key="item.quality"
				class="menu-item"
				:class="{ active: item.quality === source.current?.value.quality }"
				@click="handleQualityChange(item)"
			>
				{{ getDisplayQuality(item) }}
			</div>
		</Menu>

	</div>
</template>

<script setup lang="ts">
import { computed, shallowRef } from "vue";
import { usePlayerContext } from "../../hooks/usePlayerProvide";
import type { VideoSource } from "../../types";
import Menu from "../Menu/index.vue";

const { source, subtitles } = usePlayerContext();
const menuVisible = shallowRef(false);
const buttonRef = shallowRef<HTMLElement>();

const currentQuality = computed(() => {
	if (!source.current.value) return "自动";
	const quality =
		source.current.value.displayQuality || source.current.value.quality;
	return typeof quality === "number" ? `${quality}P` : quality;
});

const toggleMenu = () => {
	menuVisible.value = !menuVisible.value;
};

const handleMenuVisibleChange = (visible: boolean) => {
	menuVisible.value = visible;
};

const getDisplayQuality = (sourceValue: VideoSource) => {
	const quality = sourceValue.displayQuality || sourceValue.quality;
	return typeof quality === "number" ? `${quality}P` : quality;
};

const handleQualityChange = async (sourceValue: VideoSource) => {
	menuVisible.value = false;
	await source.changeQuality(sourceValue);
	subtitles.restoreCurrentSubtitle();
};
</script>

<style scoped>
.quality-button {
	position: relative;
	padding: 6px 12px;
	color: #fff;
	cursor: pointer;
	border-radius: 6px;
	transition: all 0.2s;
	font-size: 14px;
	display: flex;
	align-items: center;
	gap: 4px;
	user-select: none;
}

.quality-button:hover {
	background: rgba(255, 255, 255, 0.15);
}

.tooltip {
	padding: 6px 12px;
	color: #fff;
	font-size: 12px;
	white-space: nowrap;
	background: rgba(28, 28, 28, 0.95);
	backdrop-filter: blur(20px);
	border-radius: 6px;
}

:deep(.menu-item) {
	position: relative;
	padding: 8px 12px;
	color: #fff;
	cursor: pointer;
	transition: all 0.2s;
	font-size: 14px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-radius: 6px;
	margin: 2px 0;
}

:deep(.menu-item:hover) {
	background: rgba(255, 255, 255, 0.1);
}

:deep(.menu-item.active) {
	color: var(--x-player-color-primary, #007aff);
	background: rgba(0, 122, 255, 0.1);
}

:deep(.menu-item.active::after) {
	content: "";
	position: absolute;
	right: 12px;
	width: 16px;
	height: 16px;
	background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23007aff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>');
	background-size: contain;
	background-repeat: no-repeat;
	background-position: center;
}
</style> 