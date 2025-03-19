<template>
	<div class="volume-control">
		<button class="volume-control-button" @click="volume.toggleMute">
			<Icon :svg="VolumeIcon" class="icon" />
		</button>
		<div class="volume-slider">
			<div class="volume-slider-track">
				<div 
					class="volume-slider-fill"
					:style="{ width: `${volume.volume.value}%` }"
				></div>
				<input
					type="range"
					min="0"
					max="100"
					:value="volume.volume.value"
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

const { volume } = usePlayerContext();

const VolumeIcon = computed(() => {
	if (volume.muted.value) {
		return VolumeOff;
	}

	if (volume.volume.value < 50) {
		return VolumeDown;
	}

	if (volume.volume.value >= 50) {
		return VolumeUp;
	}

	return VolumeUp;
});

const handleVolumeChange = (event: Event) => {
	const value = Number((event.target as HTMLInputElement).value);
	volume.setVolume(value);
};
</script>

<style scoped>
.volume-control {
	display: flex;
	align-items: center;
	gap: 8px;
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
	width: 80px;
	display: flex;
	align-items: center;
}

.volume-slider-track {
	position: relative;
	width: 100%;
	height: var(--x-player-volume-control-height);
}

.volume-slider-fill {
	position: absolute;
	height: 100%;
	background-color: var(--x-player-volume-control-fill-color);
	border-radius: calc(var(--x-player-volume-control-height) / 2);
	pointer-events: none;
}

.volume-slider input[type="range"] {
	position: absolute;
	width: 100%;
	height: 100%;
	background: var(--x-player-volume-control-track-color);
	border-radius: calc(var(--x-player-volume-control-height) / 2);
	outline: none;
	cursor: pointer;
	margin: 0;
	padding: 0;
}

.volume-slider input[type="range"]::-webkit-slider-thumb {
	-webkit-appearance: none;
	width: var(--x-player-volume-control-thumb-size);
	height: var(--x-player-volume-control-thumb-size);
	border-radius: 50%;
	background: var(--x-player-volume-control-thumb-color);
	cursor: pointer;
	transition: all 0.2s ease;
	position: relative;
	z-index: 1;
}

.volume-slider input[type="range"]::-webkit-slider-thumb:hover {
	transform: scale(1.2);
}

.volume-slider input[type="range"]::-moz-range-thumb {
	width: var(--x-player-volume-control-thumb-size);
	height: var(--x-player-volume-control-thumb-size);
	border: none;
	border-radius: 50%;
	background: var(--x-player-volume-control-thumb-color);
	cursor: pointer;
	transition: all 0.2s ease;
	position: relative;
	z-index: 1;
}

.volume-slider input[type="range"]::-moz-range-thumb:hover {
	transform: scale(1.2);
}

.volume-slider input[type="range"]::-ms-thumb {
	width: var(--x-player-volume-control-thumb-size);
	height: var(--x-player-volume-control-thumb-size);
	border-radius: 50%;
	background: var(--x-player-volume-control-thumb-color);
	cursor: pointer;
	transition: all 0.2s ease;
	position: relative;
	z-index: 1;
}

.volume-slider input[type="range"]::-ms-thumb:hover {
	transform: scale(1.2);
}

.material-symbols-rounded {
	font-size: 24px;
}
</style> 