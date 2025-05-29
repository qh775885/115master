<template>
  <div :class="styles.container">
    <div :class="styles.animation.wrapper">
      <span :class="[styles.animation.dot, styles.animation.dot1]"></span>
      <span :class="[styles.animation.dot, styles.animation.dot2]"></span>
      <span :class="[styles.animation.dot, styles.animation.dot3]"></span>
    </div>

    <div v-if="playerCore?.type === PlayerCoreType.AvPlayer && (playerCore.stats?.bandwidth ?? 0) > 0" 
         :class="styles.speed">
      {{ Math.round((playerCore.stats?.bandwidth ?? 0) / 1024 / 1024 * 100) / 100 }} Mbps/s
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlayerCoreType } from "../../hooks/playerCore/types";
import { usePlayerContext } from "../../hooks/usePlayerProvide";

// 样式抽象
const styles = {
	container:
		"absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2] flex flex-col items-center gap-2 drop-shadow-xl/30",
	animation: {
		wrapper: "inline-flex items-center justify-between gap-2.5",
		dot: [
			"w-2.5 h-2.5 bg-white rounded-full",
			"animate-[bounce_1.4s_infinite_ease-in-out_both]",
		],
		dot1: "[animation-delay:-0.32s]",
		dot2: "[animation-delay:-0.16s]",
		dot3: "",
	},
	speed: "text-sm font-semibold text-base-content",
};

const { playerCore } = usePlayerContext();
</script>

<style>
/* 自定义动画关键帧 */
@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.3;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style> 