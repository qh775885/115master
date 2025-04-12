<template>
	<button 
        
		ref="buttonRef"
		title="音频轨道"
		@click="toggleVisible"
		:disabled="playerCore?.type !== PlayerCoreType.AvPlayer"
	>
		<span>
			<Icon :svg="AudioFileSvg"></Icon>
		</span>
		
		<Menu
			v-if="playerCore?.type === PlayerCoreType.AvPlayer"
			v-model:visible="menuVisible"
			:triggerRef="buttonRef"
			placement="top"
		>
			<div
				v-for="(stream, index) in playerCore.audioStreams"
				:key="stream.id"
				:class="[
					$style['menu-item'],
					{
						[$style['active']]: playerCore.audioStreamId === stream.id,
						[$style['disabled']]: !playerCore.isSupportStream(stream)
					}
				]"
				:title="playerCore.isSupportStream(stream) ? '切换音频轨道' : '不支持该音频轨道'"
				@click="playerCore.setAudioStream(stream.id)"
			>
				<span :class="$style['menu-item-title']">
					{{ stream.id }}. {{ stream.metadata.title ?? 'Untitled' }}
				</span>
				<span :class="$style['menu-item-language']">
					{{ stream.metadata.language }}
				</span>
			</div>
		</Menu>

	</button>
</template>

<script setup lang="ts">
import AudioFileSvg from "@material-symbols/svg-400/rounded/audio_file.svg";
import { computed, shallowRef } from "vue";
import Icon from "../../../Icon/index.vue";
import { PlayerCoreType } from "../../hooks/playerCore/types";
import { usePlayerContext } from "../../hooks/usePlayerProvide";
import type { VideoSource } from "../../types";
import Menu from "../Menu/index.vue";

const { source, subtitles, playerCore } = usePlayerContext();
const menuVisible = shallowRef(false);
const buttonRef = shallowRef<HTMLElement>();

const toggleVisible = () => {
	menuVisible.value = !menuVisible.value;
};
</script>

<style module>
.menu-item {
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
	
	&:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	&.active {
		color: var(--x-player-color-primary, #007aff);
		background: rgba(0, 122, 255, 0.1);
	}

	&.disabled {
		color: rgba(255, 255, 255, 0.5);
		background: rgba(255, 255, 255, 0.05);
		cursor: not-allowed;
	}	
}

.menu-item-title {
	font-size: 14px;
	font-weight: 500;
}

.menu-item-language {
	font-size: 12px;
	color: rgba(255, 255, 255, 0.5);
}

</style> 