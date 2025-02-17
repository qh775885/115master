<template>
	<button @click="playing.togglePlay">
		<span class="material-symbols-rounded">
			{{ playing.isPlaying.value ? "pause" : "play_arrow" }}
		</span>
	</button>
</template>

<script setup lang="ts">
import { usePlayerContext } from "../../hooks/usePlayer";

const { playing } = usePlayerContext();
</script> 