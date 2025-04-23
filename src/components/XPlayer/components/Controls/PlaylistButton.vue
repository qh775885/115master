<template>
	<button 
		title="播放列表(B)"
		@click="fullscreen.toggleShowSider" 
	>
		<Icon :svg="SubscriptionsSvg" />
	</button>
</template>

<script setup lang="ts">
import SubscriptionsSvg from "@material-symbols/svg-400/rounded/subscriptions.svg?component";
import Icon from "../../../../components/Icon/index.vue";
import { usePlayerContext } from "../../hooks/usePlayerProvide";
const { fullscreen } = usePlayerContext();
</script>

<style module>
</style>
