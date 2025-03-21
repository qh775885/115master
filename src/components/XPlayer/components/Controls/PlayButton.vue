<template>
	<button 
		@click="playing.togglePlay"
		:title="playing.isPlaying.value ? '暂停(Space)' : '播放(Space)'"
	>
		<Icon :svg="icon" class="icon" />
	</button>
</template>

<script setup lang="ts">
import Pause from "@material-symbols/svg-400/rounded/pause.svg?component";
import PlayArrow from "@material-symbols/svg-400/rounded/play_arrow.svg?component";
import { computed } from "vue";
import Icon from "../../../../components/Icon/index.vue";
import { usePlayerContext } from "../../hooks/usePlayerProvide";

const { playing } = usePlayerContext();

const icon = computed(() => {
	return playing.isPlaying.value ? Pause : PlayArrow;
});
</script>

<style scoped>
.icon {
	width: 24px;
	height: 24px;
	vertical-align: middle;
	fill: currentColor;
}
</style>
