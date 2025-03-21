<template>
	<div class="subtitle-button">
		<button
			ref="buttonRef"
			class="control-button"
			:title="`${subtitles.list.value?.length ? '字幕(C)' : '未找到字幕'}`"
			:disabled="subtitles.loading.value || !subtitles.ready.value|| subtitles.list.value?.length === 0"
			@click="toggleMenu"
		>
			<!-- loading -->
			<Icon 
				v-if="subtitles.loading.value || !subtitles.ready.value"
				:svg="ProgressActivity"
				class="loading-icon"
			/>
			<!-- found 字幕 -->
			<Icon 
				v-else 
				:svg="subtitles.current.value ? Subtitles : SubtitlesOff"
				class="subtitle-icon"
				:class="{
					'disabled': subtitles.list.value?.length === 0
				}"/>
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
				@click="handleDisableSubtitle"
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
import SubtitlesOff from "@material-symbols/svg-400/rounded/subtitles_off.svg?component";
import { shallowRef } from "vue";
import Icon from "../../../../components/Icon/index.vue";
import { usePlayerContext } from "../../hooks/usePlayerProvide";
import type { Subtitle } from "../../types";
import Menu from "../Menu/index.vue";

const { subtitles } = usePlayerContext();
const menuVisible = shallowRef(false);
const buttonRef = shallowRef<HTMLElement>();

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

const handleDisableSubtitle = () => {
	menuVisible.value = false;
	subtitles.change(null);
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
	&.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
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