<template>
	<div :class="$style['subtitle-button']">
		<button
			ref="buttonRef"
			:class="$style['control-button']"
			:title="`${subtitles.list.value?.length ? '字幕(C)' : '未找到字幕'}`"
			:disabled="subtitles.loading.value || !subtitles.ready.value|| subtitles.list.value?.length === 0"
			@click="toggleMenu"
		>
			<!-- loading -->
			<Icon 
				v-if="subtitles.loading.value || !subtitles.ready.value"
				:class="$style['loading-icon']"
				:svg="ProgressActivity"
			/>
			<!-- found 字幕 -->
			<Icon 
				v-else 
				:svg="subtitles.current.value ? Subtitles : SubtitlesOff"
				:class="[
					$style['subtitle-icon'],
					{
						[$style['disabled']]: subtitles.list.value?.length === 0
					}
				]"/>
		</button>
		<Menu
			v-model:visible="menuVisible"
			:triggerRef="buttonRef"
			placement="top"
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
				<div :class="$style['menu-item-content']">
					<span :class="$style['subtitle-label']">{{ subtitle.label }}</span>
					<span v-if="subtitle.source" :class="$style['subtitle-source']">
						{{ subtitle.source }}
					</span>
				</div>
				
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

const handleSubtitleSelect = (subtitle: Subtitle | null) => {
	menuVisible.value = false;
	subtitles.change(subtitle);
};

const handleDisableSubtitle = () => {
	menuVisible.value = false;
	subtitles.change(null);
};
</script>

<style module>
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

.menu-item-content {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 6px;
	flex: 1;
}

.subtitle-label {
	font-size: 14px;
}

.subtitle-source {
	display: inline-flex;
	align-items: center;
	font-size: 8px;
	color: #000;
	background-color: rgba(195, 195, 195, 0.5);
	padding: 2px 6px;
	border-radius: 8px;
	flex-shrink: 0;
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