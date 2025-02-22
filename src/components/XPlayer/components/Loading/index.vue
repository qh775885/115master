<template>
  <div class="loading-container" v-show="show">
    <div class="apple-loading">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
	show: boolean;
}>();
</script>

<style scoped>
.loading-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.apple-loading {
  position: relative;
  width: 50px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.apple-loading span {
  width: 10px;
  height: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  display: inline-block;
  animation: bounce 1.4s infinite ease-in-out both;
}

.apple-loading span:nth-child(1) {
  animation-delay: -0.32s;
}

.apple-loading span:nth-child(2) {
  animation-delay: -0.16s;
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