<template>
	<transition
		enter-active-class="transition-all duration-200 ease-out"
		leave-active-class="transition-all duration-200 ease-out"
		enter-from-class="opacity-0"
		enter-to-class="opacity-100"
		leave-from-class="opacity-100"
		leave-to-class="opacity-0"
	>
		<div 
			v-if="!progressBar?.isLongPressDragging.value"
			:class="styles.root">
			<slot></slot>
		</div>
	</transition>
</template>

<script setup lang="ts">
import { usePlayerContext } from "../../hooks/usePlayerProvide";

const { progressBar } = usePlayerContext();

const styles = {
	root: [
		"absolute inset-y-0 right-0 flex flex-col justify-end items-center gap-2 px-7 pb-2",
	],
};
</script>