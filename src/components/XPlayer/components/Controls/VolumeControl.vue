<template>
	<div :class="$style['volume-control']">
		<button 
			:class="$style['volume-control-button']" 
			title="音量"
			@click="playerCore?.toggleMute"
		>
			<Icon :svg="VolumeIcon" :class="$style.icon" />
		</button>
		<div :class="$style['volume-slider']">
			<div :class="$style['volume-slider-container']">
				<div :class="$style['volume-slider-track']"></div>
				<div 
					:class="$style['volume-slider-fill']"
					:style="{ width: `${playerCore?.volume}%` }"
				></div>
				<div 
					:class="$style['volume-slider-thumb']"
					:style="{ left: `${playerCore?.volume}%` }"
				></div>
				<input
					type="range"
					:class="$style['volume-slider-input']"
					min="0"
					max="100"
					:value="playerCore?.volume"
					@input="handleVolumeChange"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import VolumeDown from "@material-symbols/svg-400/rounded/volume_down.svg?component";
import VolumeOff from "@material-symbols/svg-400/rounded/volume_off.svg?component";
import VolumeUp from "@material-symbols/svg-400/rounded/volume_up.svg?component";
import { computed } from "vue";
import Icon from "../../../../components/Icon/index.vue";
import { usePlayerContext } from "../../hooks/usePlayerProvide";

const { playerCore } = usePlayerContext();

const VolumeIcon = computed(() => {
	if (playerCore.value?.muted) {
		return VolumeOff;
	}

	if (playerCore.value?.volume < 50) {
		return VolumeDown;
	}

	if (playerCore.value?.volume >= 50) {
		return VolumeUp;
	}

	return VolumeUp;
});

const handleVolumeChange = (event: Event) => {
	const value = Number((event.target as HTMLInputElement).value);
	playerCore.value?.setVolume(value);
};
</script>

<style module>
.volume-control {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-right: 8px;
}

.volume-control-button {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	padding: 4px;
	border: none;
	background: transparent;
	cursor: pointer;
	color: white;
}

.volume-control-button:hover {
	opacity: 0.8;
}

.volume-slider {
	width: 90px;
	height: 24px;
	display: flex;
	align-items: center;
}

.volume-slider-container {
	position: relative;
	width: 100%;
	height: 4px;
}

.volume-slider-track {
	position: absolute;
	width: 100%;
	height: 100%;
	background-color: rgba(255, 255, 255, 0.3);
	border-radius: 2px;
}

.volume-slider-fill {
	position: absolute;
	height: 100%;
	background-color: var(--x-player-color-primary);
	border-radius: 2px;
}

.volume-slider-thumb {
	position: absolute;
	width: 12px;
	height: 12px;
	background-color: #fff;
	border-radius: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	pointer-events: none;
	opacity: 0;
	transition: opacity 0.2s;
}

.volume-slider:hover .volume-slider-thumb {
	opacity: 1;
}

.volume-slider-input {
	position: absolute;
	top: -8px;
	left: 0;
	width: 100%;
	height: 20px;
	opacity: 0;
	cursor: pointer;
	margin: 0;
	padding: 0;
}

.icon {
	font-size: 24px;
}
</style> 