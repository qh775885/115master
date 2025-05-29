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
			:class="[styles.root]" 
			@mouseenter="controls.setIsMouseInControls(true)"
			@mouseleave="controls.setIsMouseInControls(false)"
			>
			<div :class="[styles.bg]"></div>
			<div 
				:class="[
					styles.content.root,
				]"
				>
				<slot name="left"></slot>
				<div :class="[styles.content.left]">
					{{ props.title }}
				</div>
			</div>
		</div>
	</transition>
</template>

<script setup lang="ts">
import { usePlayerContext } from "../../hooks/usePlayerProvide";
const { controls, progressBar } = usePlayerContext();

const styles = {
	root: "relative",
	content: {
		root: "relative flex justify-between items-center p-7",
		left: "flex-1 font-bold",
		right: {
			root: "flex-1",
			item: "flex justify-end gap-2",
		},
	},
	bg: "absolute inset-0 bottom-[-50px] bg-linear-to-b from-black/30 to-transparent pointer-events-none",
};

const props = defineProps<{
	title?: string;
}>();
</script>