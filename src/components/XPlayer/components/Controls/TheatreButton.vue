<template>
	<button 
		v-if="!fullscreen.isFullscreen.value"
		:title="fullscreen.theatre.value ? '正常模式(V)' : '剧院模式(V)'"
		@click="fullscreen.toggleTheatre" 
	>
		<Icon :svg="fullscreen.theatre.value ? WidthWide : FitPageWidth" class="icon" />
	</button>
</template>

<script setup lang="ts">
import FitPageWidth from "@material-symbols/svg-400/rounded/fit_page_width.svg?component";
import WidthWide from "@material-symbols/svg-400/rounded/width_wide.svg?component";
import Icon from "../../../../components/Icon/index.vue";
import { usePlayerContext } from "../../hooks/usePlayerProvide";
const { fullscreen } = usePlayerContext();
</script>