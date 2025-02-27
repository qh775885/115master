<template>
  <div class="loading-error">
    <svg
      class="loading-error-icon"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- 圆圈 -->
      <circle
        class="loading-error-circle"
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      />
      <!-- 叉号 -->
      <path
        class="loading-error-cross"
        d="M8 8L16 16M8 16L16 8"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
    <span class="loading-error-text">
      <slot>{{ message || defaultMessage }}</slot>
    </span>
    <span class="loading-error-detail">
      {{ detail }}
    </span>
    <button 
      v-if="retryable" 
      class="loading-error-retry"
      @click="$emit('retry')"
    >
      {{ retryText }}
    </button>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
	retryable?: boolean;
	message?: string;
	detail?: string;
	retryText?: string;
}>();

defineEmits<(e: "retry") => void>();

const defaultMessage = "加载失败";
</script>

<style scoped>
.loading-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  color: #666;
}

.loading-error-icon {
  width: 48px;
  height: 48px;
  color: #ff4d4f;
  animation: error-appear 0.3s ease-out;
}

.loading-error-circle {
  opacity: 0;
  animation: circle-appear 0.3s ease-out 0.2s forwards;
  transform-origin: center;
}

.loading-error-cross {
  opacity: 0;
  animation: cross-appear 0.3s ease-out 0.4s forwards;
  transform-origin: center;
}

.loading-error-text {
  font-size: 14px;
  animation: text-appear 0.3s ease-out 0.5s both;
}

.loading-error-detail {
  font-size: 12px;
  color: #999;
  animation: text-appear 0.3s ease-out 0.5s both;
}

.loading-error-retry {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  background: #ff4d4f;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  animation: text-appear 0.3s ease-out 0.6s both;
}

.loading-error-retry:hover {
  background: #ff7875;
}

.loading-error-retry:active {
  background: #d9363e;
}

@keyframes error-appear {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes circle-appear {
  from {
    stroke-dasharray: 0 100;
    transform: rotate(-90deg);
    opacity: 0;
  }
  to {
    stroke-dasharray: 100 100;
    transform: rotate(90deg);
    opacity: 1;
  }
}

@keyframes cross-appear {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes text-appear {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style> 