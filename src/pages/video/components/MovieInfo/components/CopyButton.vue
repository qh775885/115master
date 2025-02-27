<template>
  <button 
    class="copy-button" 
    @click="handleCopy"
    :class="{ copied: isCopied }"
  >
    <span class="copy-button-text">{{ isCopied ? '已复制' : '复制' }}</span>
  </button>
</template>

<script setup lang="ts">
import { useCopy } from "../hooks/useCopy";

const props = defineProps<{
	/** 要复制的文本 */
	text: string;
	/** 复制成功后状态保持的时间（毫秒） */
	duration?: number;
}>();

const { isCopied, copyText } = useCopy(props.duration);

/** 处理复制按钮点击事件 */
const handleCopy = async () => {
	try {
		await copyText(props.text);
	} catch (error) {
		// 错误已在 useCopy 中处理和记录
	}
};
</script>

<style scoped>
/* 复制按钮样式 */
.copy-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
  color: #60a5fa;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  height: 22px;
}

.copy-button:hover {
  background-color: rgba(59, 130, 246, 0.3);
}

.copy-button.copied {
  background-color: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.4);
  color: #10b981;
}

.copy-button-text {
  white-space: nowrap;
}
</style> 