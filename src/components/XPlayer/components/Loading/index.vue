<template>
  <div class="loading-container" v-show="show">
    <span></span>
    <span></span>
    <span></span>
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
  display: flex;
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