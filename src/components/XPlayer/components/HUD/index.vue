<template>
  <Popup
    v-model:visible="showMessage"
    :class="$style['hud-popup']"
    :x="16"
    :y="16"
    :lockControls="false"
  >
    <div :class="$style['hud-message-content']">
      <!-- 图标区域 -->
      <div :class="$style['message-icon']">
        <template v-if="message?.type === 'volume'">
          <Icon v-if="message.data?.value === 0" :svg="VolumeOff" />
          <Icon v-else-if="Number(message.data?.value) < 33" :svg="VolumeDown" />
          <Icon v-else-if="Number(message.data?.value) < 66" :svg="VolumeDown" />
          <Icon v-else :svg="VolumeUp" />
        </template>
        
        <template v-else-if="message?.type === 'mute'">
          <Icon :svg="message.title === '静音' ? VolumeOff : VolumeUp" />
        </template>
        
        <template v-else-if="message?.type === 'speed'">
          <Icon :svg="TimerSvg" />
        </template>
        
        <template v-else-if="message?.type === 'fastForward'">
          <Icon :svg="FastForwardSvg" />
        </template>
        
        <template v-else-if="message?.type === 'fastBackward'">
          <Icon :svg="FastRewindSvg" />
        </template>
        
        <template v-else-if="message?.type === 'subtitle'">
          <Icon :svg="message.data?.value === '关闭' || message.title === '字幕' && message.data?.value === null ? SubtitlesOff : Subtitles" />
        </template>
        
        <template v-else-if="message?.type === 'transform'">
          <Icon v-if="message.title === '旋转'" :svg="RotateSvg" />
          <Icon v-else-if="message.title === '水平翻转'" :svg="FlipSvg" style="transform: rotate(90deg);" />
          <Icon v-else-if="message.title === '垂直翻转'" :svg="FlipSvg" />
        </template>
      </div>
      
      <!-- 内容区域 -->
      <div :class="$style['message-body']">
        <div :class="$style['message-title']" v-if="message">{{ message.title }}</div>
        
        <!-- 进度条形式的值 -->
        <div v-if="message && hasProgressValue(message)" :class="$style['message-progress']">
          <div 
            :class="$style['message-progress-bar']" 
            :style="{ width: `${getProgressPercentage(message)}%` }"
          ></div>
        </div>
        
        <!-- 文本形式的值，但是不显示布尔值 -->
        <div 
          v-else-if="message?.data?.value !== undefined && typeof message.data.value !== 'boolean'" 
          :class="$style['message-value']"
        >
          {{ message.data.value }}
        </div>
      </div>
    </div>
  </Popup>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Icon from "../../../../components/Icon/index.vue";
import { usePlayerContext } from "../../hooks/usePlayerProvide";
import type { HudMessage } from "../../types/hud";
import Popup from "../Popup/index.vue";

import FastForwardSvg from "@material-symbols/svg-400/rounded/fast_forward.svg?component";
import FastRewindSvg from "@material-symbols/svg-400/rounded/fast_rewind.svg?component";
import FlipSvg from "@material-symbols/svg-400/rounded/flip.svg?component";
import RotateSvg from "@material-symbols/svg-400/rounded/rotate_right.svg?component";
import Subtitles from "@material-symbols/svg-400/rounded/subtitles.svg?component";
import SubtitlesOff from "@material-symbols/svg-400/rounded/subtitles_off.svg?component";
import TimerSvg from "@material-symbols/svg-400/rounded/timer.svg?component";
import VolumeDown from "@material-symbols/svg-400/rounded/volume_down.svg?component";
import VolumeOff from "@material-symbols/svg-400/rounded/volume_off.svg?component";
import VolumeUp from "@material-symbols/svg-400/rounded/volume_up.svg?component";

// 获取播放器上下文
const playerContext = usePlayerContext();
const { hud } = playerContext;

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

// 判断消息是否有进度值
const hasProgressValue = (message: HudMessage) => {
	// 首先检查是否有直接的progress属性
	if (message.data?.progress !== undefined) {
		return true;
	}

	// 兼容旧方式：检查是否有value、min和max
	return (
		message.data?.max !== undefined &&
		message.data?.min !== undefined &&
		message.data?.value !== undefined &&
		typeof message.data.value === "number"
	);
};

// 获取进度百分比
const getProgressPercentage = (message: HudMessage) => {
	if (!message.data) return 0;

	// 优先使用progress属性
	if (message.data.progress !== undefined) {
		return message.data.progress;
	}

	// 兼容旧方式：使用value、min和max计算
	if (hasProgressValue(message)) {
		const { value, min, max } = message.data;
		return ((Number(value) - Number(min)) / (Number(max) - Number(min))) * 100;
	}

	return 0;
};
</script>

<style module>
.hud-popup {
  padding: 12px;
  max-width: 170px;
  min-width: 120px;
  pointer-events: none;
  --x-popup-bg-color: rgba(30, 30, 30, 0.35) !important;
  --x-popup-border-radius: 12px !important;
  --x-popup-bg-blur: 6px !important;
  --x-popup-box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
}

.hud-message-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.9);
}

.message-icon {
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.95);
}

.message-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.message-title {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.8);
}

.message-value {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.5);
}

.message-progress {
  width: 100%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 3px;
}

.message-progress-bar {
  height: 100%;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 2px;
}
</style> 