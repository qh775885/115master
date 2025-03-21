<template>
	<Popup
		:class="$style['x-menu-popup']"
		v-model:visible="visibleModel"
		:x="props.x"
		:y="props.y"
		:triggerRef="triggerRef"
		:placement="props.placement"
		:offset="props.offset"
	>
		<div :class="$style['x-menu-content']" ref="menuRef">
			<slot></slot>
		</div>
	</Popup>
</template>

<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import Popup from "../Popup/index.vue";

interface Props {
	visible: boolean;
	x?: number;
	y?: number;
	triggerRef?: HTMLElement;
	placement?: "top" | "bottom";
	offset?: number;
}

const props = defineProps<Props>();
const emit = defineEmits<(e: "update:visible", value: boolean) => void>();
const visibleModel = useVModel(props, "visible", emit);
</script>

<style module>
.x-menu-popup {
	min-width: 150px;
	--x-popup-padding: 8px;
}
.x-menu-content {
	display: flex;
	flex-direction: column;
	gap: 4px;
}
</style>
<style scoped>
:deep(.menu-item) {
	padding: 8px 12px;
	color: #fff;
	cursor: pointer;
	transition: all 0.2s;
	font-size: 14px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-radius: 8px;
}

:deep(.menu-item:hover) {
	background: rgba(255, 255, 255, 0.1);
}

:deep(.menu-item.active) {
	color: var(--x-player-color-primary, #007aff);
	background: rgba(0, 122, 255, 0.1);
}

:deep(.menu-item.active::after) {
	content: "✓";
	margin-left: 8px;
}
</style> 