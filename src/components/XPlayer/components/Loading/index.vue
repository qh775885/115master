<template>
  <div :class="$style['loading']">
    <div :class="$style['loading-animation']">
      <span></span>
      <span></span>
      <span></span>
    </div>

    <div v-if="playerCore?.type === PlayerCoreType.AvPlayer && (playerCore.stats?.bandwidth ?? 0) >0" 
        :class="$style['loading-speed']">
      {{ Math.round((playerCore.stats?.bandwidth ?? 0) / 1024 / 1024 * 100) / 100 }} Mbps/s
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlayerCoreType } from "../../hooks/playerCore/types";
import { usePlayerContext } from "../../hooks/usePlayerProvide";

const { playerCore } = usePlayerContext();
</script>

<style module>
.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-animation {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  span {
    width: 10px;
    height: 10px;
    background-color: #eee;
    box-shadow: 0 0 5px 0 rgba(15, 15, 15, 0.5);
    box-sizing: border-box;
    border-radius: 50%;
    display: inline-block;
    animation: bounce 1.4s infinite ease-in-out both;
  }
  span:nth-child(1) {
    animation-delay: -0.32s;
  }
  span:nth-child(2) {
    animation-delay: -0.16s;
  }
}

.loading-speed {
  font-size: 12px;
  text-shadow: 0 0 5px 2px rgba(15, 15, 15, 0.9);
  font-weight: bold;
}

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