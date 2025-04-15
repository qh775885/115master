<template>
	<div :class="$style['time-display']">
		<span>{{ formatTime(playerCore?.currentTime) }}</span>
		<span :class="$style['time-separator']">/</span>
		<span>{{ formatTime(playerCore?.duration) }}</span>
	</div>
</template>

<script setup lang="ts">
import { usePlayerContext } from "../../hooks/usePlayerProvide";
import { formatTime } from "../../utils/time";
const { playerCore } = usePlayerContext();
</script>

<style module>
.time-display {
	color: #fff;
	font-size: 13px;
	display: flex;
	align-items: center;
	gap: 4px;
	user-select: none;
	margin-left: 6px;
}

.time-separator {
	opacity: 0.7;
}
</style> 