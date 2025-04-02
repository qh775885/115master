<template>
	<button 
		title="播放列表(B)"
		@click="fullscreen.toggleShowSider" 
	>
		<Icon :svg="SubscriptionsSvg" :class="[$style['icon'], {
			[`${$style['show']}`]: show,
		}]" />
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
.icon {
	&.show {
		fill: var(--color-primary);
	}
}
</style>
