<template>
	<button 
		@click="playerCore?.togglePlay"
		:title="playerCore?.paused ? '播放(Space)' : '暂停(Space)'"
	>
		<Icon :svg="icon" />
	</button>
</template>

<script setup lang="ts">
import Pause from "@material-symbols/svg-400/rounded/pause.svg?component";
import PlayArrow from "@material-symbols/svg-400/rounded/play_arrow.svg?component";
import { computed } from "vue";
import Icon from "../../../../components/Icon/index.vue";
import { usePlayerContext } from "../../hooks/usePlayerProvide";

const { playerCore } = usePlayerContext();

const icon = computed(() => {
	return playerCore.value?.paused ? PlayArrow : Pause;
});
</script>

<style scoped>
</style>
