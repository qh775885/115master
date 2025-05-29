<template>
	<div :class="[styles.root]">
		<button 
			:class="[styles.btn.root, 'swap swap-rotate', {
				'swap-active': playerCore?.muted
			}]"
			data-tip="静音 (M)"
			:disabled="!playerCore?.canplay"
			@click="playerCore?.toggleMute"
		>
			<Icon
				:class="[styles.btn.icon, 'swap-off']" 
				:icon="VolumeIcon"
			/>
			<Icon 
				:class="[styles.btn.icon, 'swap-on']" 
				:icon="VolumeIcon"
			/>
		</button>
		<input
			type="range"
			:class="[styles.range]"
			min="0"
			max="100"
			:value="playerCore?.volume ?? 0"
			:disabled="!playerCore?.canplay"
			@input="handleVolumeChange"
		/>
	</div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { computed } from "vue";
import { usePlayerContext } from "../../hooks/usePlayerProvide";
import { controlStyles } from "../../styles/common";
import { getVolumeIcon } from "../../utils/icon";
const { playerCore } = usePlayerContext();

const styles = {
	root: "flex items-center gap-2 mr-2",
	btn: controlStyles.btn,
	range: "range range-2xs w-24 range-primary",
};

const VolumeIcon = computed(() => {
	return getVolumeIcon(
		playerCore.value?.volume ?? 0,
		playerCore.value?.muted ?? false,
	);
});

const handleVolumeChange = (event: Event) => {
	const value = Number((event.target as HTMLInputElement).value);
	playerCore.value?.setVolume(value);
};
</script>