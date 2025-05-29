<template>
	<button 
        :class="[styles.btn.root]"
		data-tip="设置"
        ref="buttonRef"
		@click="toggleMenu"
	>
        <Icon
            :class="[
                styles.btn.icon,
                'transition-transform',
                {
                    'rotate-90': menuVisible,
                },
            ]"
            :icon="ICON_SETTINGS"
        />
	</button>
    <Popup
        v-model:visible="menuVisible"
        :trigger="buttonRef"
        placement="top"
        class="select-none"
    >
        <div :class="[styles.panel.root]">
            <!-- 左列 -->
            <div :class="[styles.panel.left]">
                <TransformSettings />
                <ThumbnailSettings />
            </div>
            
            <!-- 右列 -->
            <div :class="[styles.panel.right]">
                <VideoEnhanceSettings />
            </div>
        </div>
    </Popup>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { shallowRef } from "vue";
import { controlStyles } from "../../styles/common";
import { ICON_SETTINGS } from "../../utils/icon";
import Popup from "../Popup/index.vue";
import ThumbnailSettings from "./ThumbnailSettings.vue";
import TransformSettings from "./TransformSettings.vue";
import VideoEnhanceSettings from "./VideoEnhanceSettings.vue";

const styles = {
	...controlStyles,
	panel: {
		root: "grid grid-cols-1 md:grid-cols-2 gap-4 p-2 w-full max-w-2xl",
		left: "flex flex-col gap-4",
		right: "flex flex-col gap-4",
	},
};

const buttonRef = shallowRef<HTMLElement>();
const menuVisible = shallowRef(false);
const toggleMenu = () => {
	menuVisible.value = !menuVisible.value;
};
</script>