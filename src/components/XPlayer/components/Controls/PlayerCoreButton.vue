<template>
	<button 
		ref="buttonRef"
		title="播放器核心"
		@click="toggleVisible"
        :disabled="true || source?.current?.value?.type === 'hls'"
	>
		<span>
			{{ playerCore?.type }}
		</span>
		
		<Menu
			v-model:visible="menuVisible"
			:triggerRef="buttonRef"
			placement="top"
		>
			<div
				v-for="(type, index) in [PlayerCoreType.Native, PlayerCoreType.AvPlayer]"
				:key="type"
				:class="[
					$style['menu-item'],
                    {
                        [$style['active']]: playerCore?.type === type,
                    }
				]"
				@click="source.switchPlayerCore(type), menuVisible = false"
			>
				{{ type }}
			</div>
		</Menu>

	</button>
</template>

<script setup lang="ts">
import HubSvg from "@material-symbols/svg-400/rounded/hub.svg?component";
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
</style> 