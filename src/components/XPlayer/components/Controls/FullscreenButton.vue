<template>
	<button @click="fullscreen.toggleFullscreen">
		<Icon :svg="fullscreen.isFullscreen.value ? FullscreenExit : Fullscreen" class="icon" />
	</button>
</template>

<script setup lang="ts">
import Fullscreen from "@material-symbols/svg-400/rounded/fullscreen.svg?component";
import FullscreenExit from "@material-symbols/svg-400/rounded/fullscreen_exit.svg?component";
import Icon from "../../../../components/Icon/index.vue";
import { usePlayerContext } from "../../hooks/usePlayer";
const { fullscreen } = usePlayerContext();
</script>