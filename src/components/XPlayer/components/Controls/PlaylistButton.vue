<template>
	<button 
		:class="$style['playlist-button']"
		title="播放列表(B)"
		@click="fullscreen.toggleShowSider" 
	>
		<Icon :svg="SubscriptionsSvg" />
	</button>
</template>

<script setup lang="ts">
import SubscriptionsSvg from "@material-symbols/svg-400/rounded/subscriptions.svg?component";
import { computed } from "vue";
import Icon from "../../../../components/Icon/index.vue";
import { usePlayerContext } from "../../hooks/usePlayerProvide";
const { fullscreen } = usePlayerContext();
const show = computed(() => {
	return fullscreen.showSider.value;
});
</script>

<style module>
.playlist-button {
	background-color: transparent;
	border: none;
	padding: 0;
	border-radius: 50%;
	background-color: rgba(15, 15, 15, 0.9);
	box-shadow: 0 0 10px 0 rgba(55, 55, 55, 0.5);
	backdrop-filter: blur(20px) saturate(180%);
	padding: 8px;
	cursor: pointer;
}
</style>
