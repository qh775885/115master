<template>
	<transition
		enter-active-class="transition-opacity duration-100"
		leave-active-class="transition-opacity duration-100"
		enter-from-class="opacity-0"
		leave-to-class="opacity-0"
	>
		<div 
			v-if="controls.visible.value"
			:class="styles.root">
			<slot ></slot>
		</div>
	</transition>
	
</template>

<script setup lang="ts">
import { usePlayerContext } from "../../hooks/usePlayerProvide";

const styles = {
	root: "absolute inset-0 flex flex-col",
};

const { controls } = usePlayerContext();
</script>