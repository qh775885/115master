<template>
	<div class="subtitle-button">
		<button
			ref="buttonRef"
			class="control-button"
			@click="toggleMenu"
			:title="'字幕'"
			alt="字幕"
			:disabled="subtitles.loadingSubtitles.value"
		>
			<Icon 
				v-if="subtitles.loadingSubtitles.value"
				:svg="ProgressActivity"
				class="loading-icon"
			/>
			<Icon v-else :svg="Subtitles"/>
		</button>
		<Menu
			v-model:visible="menuVisible"
			:triggerRef="buttonRef"
			placement="top"
			@update:visible="handleMenuVisibleChange"
		>
			<div
				class="menu-item"
				:class="{ active: subtitles.current.value === null }"
				@click="handleSubtitleSelect(null)"
			>
				关闭字幕
			</div>
			<div
				v-for="subtitle in subtitles.list.value"
				:key="subtitle.url"
				class="menu-item"
				:class="{ active: subtitles.current.value?.url === subtitle.url }"
				@click="handleSubtitleSelect(subtitle)"
			>
				{{ subtitle.label }}
			</div>
		</Menu>
	</div>
</template>

<script setup lang="ts">
import ProgressActivity from "@material-symbols/svg-400/rounded/progress_activity.svg?component";
import Subtitles from "@material-symbols/svg-400/rounded/subtitles.svg?component";
import { ref } from "vue";
import Icon from "../../../../components/Icon/index.vue";
import { usePlayerContext } from "../../hooks/usePlayer";
import type { Subtitle } from "../../types";
import Menu from "../Menu/index.vue";

const { rootProps, subtitles } = usePlayerContext();
const menuVisible = ref(false);
const buttonRef = ref<HTMLElement>();

const toggleMenu = () => {
	menuVisible.value = !menuVisible.value;
};

const handleMenuVisibleChange = (visible: boolean) => {
	menuVisible.value = visible;
};

const handleSubtitleSelect = (subtitle: Subtitle | null) => {
	menuVisible.value = false;
	subtitles.change(subtitle);
};
</script>

<style scoped>
.subtitle-button {
	position: relative;
	display: inline-block;
}

.control-button {
	background: none;
	border: none;
	color: #fff;
	cursor: pointer;
	padding: 8px;
	transition: all 0.2s;
}

.control-button:hover {
	opacity: 0.8;
}

.subtitle-icon {
	width: 24px;
	height: 24px;
}

.loading-icon {
	animation: spin 1s linear infinite;
}

@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}
</style> 