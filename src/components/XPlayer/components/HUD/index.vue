<template>
    <Popup class="left-4! top-4!" 
        :visible="showMessage"
        :x="0" 
        :y="0"
        :outside-stop-propagation="false">
        <div
            v-if="message"
            class="flex items-center gap-2 px-2">
            <!-- 图标区域 -->
            <Icon v-if="message.icon"
                class="size-6"
                :class="message.iconClass ?? ''"
                :icon="message.icon"
            />

            <!-- 内容区域 -->
            <div class="flex flex-col gap-1 flex-1 px-1">
                <!-- 标题 -->
                <div v-if="message.title" 
                    class="text-sm font-semibold">
                    {{ message.title ?? '' }}
                </div>

                <!-- 进度条 -->
                <progress
                    v-if="message && message.progress"
                    class="progress progress-primary h-1.5 w-35"
                    :value="message.progress.value"
                    :min="message.progress.min"
                    :max="message.progress.max">
                </progress>

                <!-- 显示值 -->
                <div v-if="message.value"
                    class="text-sm font-semibold text-base-content/50">
                    {{ message.value }}
                </div>
            </div>
        </div>
    </Popup>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { computed, ref, watch } from "vue";
import { usePlayerContext } from "../../hooks/usePlayerProvide";
import Popup from "../Popup/index.vue";

// 获取播放器上下文
const { hud } = usePlayerContext();

// 显示状态
const showMessage = ref(false);

// 当前消息
const message = computed(() => {
	return hud?.messages.value[0] || null;
});

// 监视消息变化，显示/隐藏弹窗
watch(message, (newMessage) => {
	showMessage.value = !!newMessage;
});
</script>