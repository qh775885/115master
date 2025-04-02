<template>
	<div :class="$style['controls']">
		<ControlHeader />
		<div :class="$style['controls__mask']"
			@click="playing.togglePlay"
			@dblclick="fullscreen.toggleFullscreen"
		>
		</div>
		<ControlBar />
	</div>
</template>

<script setup lang="ts">
import { usePlayerContext } from "../../hooks/usePlayerProvide";
import ControlBar from "./ControlBar.vue";
import ControlHeader from "./ControlHeader.vue";
const { playing, fullscreen } = usePlayerContext();
</script>

<style module>
.controls {
	position: absolute;
	top: 0;
	right: 0;
	left: 0;
	bottom: 0;
	display: flex;
	flex-direction: column;
}
.controls__mask {
	flex: 1;
}
</style>