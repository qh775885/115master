<template>
	<button @click="fullscreen.toggleFullscreen">
		<span class="material-symbols-rounded">
			{{ fullscreen.isFullscreen.value ? "fullscreen_exit" : "fullscreen" }}
		</span>
	</button>
</template>

<script setup lang="ts">
import { usePlayerContext } from "../../hooks/usePlayer";

const { fullscreen } = usePlayerContext();
</script>