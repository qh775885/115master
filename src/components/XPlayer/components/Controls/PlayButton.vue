<template>
	<button
		:class="[
			styles.btn.root,
			'swap swap-rotate',
			{
				'swap-active': playerCore?.paused
			}
		]"
		:disabled="!playerCore?.canplay"
		data-tip="播放/暂停 (Space)"
		@click="playerCore?.togglePlay"
	>
		<Icon :icon="ICON_PASUE" :class="[
			styles.btn.icon,
			'swap-off'
		]" />
		<Icon :icon="ICON_PLAY" :class="[
			styles.btn.icon,
			'swap-on'
		]" />
	</button>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { usePlayerContext } from "../../hooks/usePlayerProvide";
import { controlStyles } from "../../styles/common";
import { ICON_PASUE, ICON_PLAY } from "../../utils/icon";

const styles = {
	btn: {
		...controlStyles.btn,
		root: [controlStyles.btn.root, "before:ml-8"],
	},
};

const { playerCore } = usePlayerContext();
</script>