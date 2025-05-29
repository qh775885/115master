<template>
  <div :class="styles.container">
    <Icon :icon="iconName" :class="styles.icon" />
    <p :class="styles.text">
      <slot>{{ message || defaultMessage }}</slot>
    </p>
	<template v-if="props.detail">
		<p v-if="!props.fold" :class="styles.detail" v-html="handleDetail(props.detail)"></p>
		<button v-else :class="styles.detailButton" @click="handleShowDetail">查看错误</button>
	</template>
    <button 
      v-if="props.retryable" 
      :class="styles.retryButton"
      @click="$emit('retry')"
    >
      {{ props.retryText }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import { useClipboard } from "@vueuse/core";
import { computed } from "vue";
import { ICON_ERROR } from "../../icons";

const props = withDefaults(
	defineProps<{
		// 是否可重试
		retryable?: boolean;
		// 错误信息
		message?: string;
		// 错误详情
		detail?: string | Error | unknown;
		// 重试按钮文本
		retryText?: string;
		// 是否无内边距
		noPadding?: boolean;
		// 大小
		size?: "mini" | "small" | "medium" | "large";
		// 图标名称
		icon?: string;
		// 是否折叠显示详情
		fold?: boolean;
	}>(),
	{
		retryable: false,
		message: "加载失败",
		detail: undefined,
		retryText: "重试",
		noPadding: false,
		size: "medium",
		icon: ICON_ERROR,
	},
);

defineEmits<(e: "retry") => void>();

const defaultMessage = "加载失败";

const iconName = computed(() => props.icon);

// 样式常量定义
const styles = computed(() => ({
	// 容器样式
	container: [
		"flex flex-col items-center justify-center text-base-content/70",
		// 间距和内边距
		props.size === "mini" ? "gap-1" : "gap-2",
		!props.noPadding && props.size !== "mini" && "p-2",
		// 动画效果
		"animate-in fade-in duration-300",
	],
	// 图标样式
	icon: [
		"text-error",
		// 根据尺寸调整图标大小
		{
			mini: "text-2xl",
			small: "text-3xl",
			medium: "text-5xl",
			large: "text-6xl",
		}[props.size],
	],
	// 文本样式
	text: [
		"text-center m-0 select-text font-medium",
		// 根据尺寸调整字体大小
		{
			mini: "text-xs",
			small: "text-sm",
			medium: "text-base",
			large: "text-lg",
		}[props.size],
	],
	// 详情样式
	detail: [
		"text-center m-0 text-base-content/50 select-text whitespace-pre-line font-mono",
		// 根据尺寸调整字体大小
		{
			mini: "text-xs",
			small: "text-xs",
			medium: "text-sm",
			large: "text-base",
		}[props.size],
	],
	// 详情按钮样式
	detailButton: ["btn btn-error btn-xs"],
	// 重试按钮样式
	retryButton: [
		"btn btn-error btn-sm transition-all duration-200",
		"hover:btn-error hover:scale-105 active:scale-95",
	],
}));

// 处理错误详情
const handleDetail = (detail: string | Error | unknown): string => {
	if (detail instanceof Error) {
		return `[Error name]: ${detail.name}\n[Error message]: ${detail.message}\n[Error stack]: ${detail.stack}`;
	}
	return detail as string;
};

// 显示详情
const handleShowDetail = () => {
	const detail = handleDetail(props.detail);
	const { copy } = useClipboard();
	copy(detail);
	alert(detail);
	alert("已将错误信息复制到剪贴板");
};
</script> 