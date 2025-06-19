<template>
    <div 
		ref="rootRef"
		:class="[styles.item.base, { [styles.item.active]: props.active }]"
        @click="handlePlay(item)"
    >
		<div :class="styles.preview.container">

			<template v-if="preview.error">
				<LoadingError 
					:class="styles.preview.imageError"
					:message="preview.error"
					size="mini"
				/>
			</template>

			<div v-else-if="preview.isLoading" :class="styles.preview.skeleton">
			</div>
			
			<!-- 预览图 -->
			<img v-else-if="preview.isReady" :src="preview.state[0]?.img" :class="styles.preview.image" />

			<!-- 无预览图时显示骨架 -->
			<div v-else :class="styles.preview.skeleton"></div>

			<!-- 时长 -->
			<div :class="styles.duration.container">
				{{ formatTime(item.play_long) }}
			</div>

			<!-- 收藏 -->
			<div :class="styles.mark.container" v-if="item.m">
				<Icon :icon="ICON_STAR_FILL" :class="styles.mark.icon" />
			</div>

			<!-- 进度条 -->
			<div :class="styles.progress.container" v-if="item.current_time > 0">
				<div :class="styles.progress.bar" :style="{ width: `${progressPercent * 100}%` }"></div>
			</div>
		</div>
        <div :class="styles.info.container">
			<!-- 标题 -->
			<div :class="[styles.info.title, { [styles.info.titleActive]: props.active }]" :title="item.n">
				{{ item.n }}
			</div>
			<!-- 大小 -->
			<div :class="styles.info.size">
				{{ formatFileSize(item.s) }}
			</div>
		</div>
    </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { computed, shallowRef } from "vue";
import LoadingError from "../../../../components/LoadingError/index.vue";
import { formatTime } from "../../../../components/XPlayer/utils/time";
import { FRIENDLY_ERROR_MESSAGE } from "../../../../constants";
import { useSmartPreview } from "../../../../hooks/usePreview";
import { ICON_STAR_FILL } from "../../../../icons";
import type { Entity } from "../../../../utils/drive115";
import { Drive115Error } from "../../../../utils/drive115/core";
import { formatFileSize } from "../../../../utils/format";
// 播放列表预览封面数量
const PLAYLIST_PREVIEW_NUM = 1;

const props = defineProps<{
	item: Entity.PlaylistItem;
	active: boolean;
}>();

const emit = defineEmits<{
	play: [Entity.PlaylistItem];
}>();

// 样式常量定义
const styles = {
	item: {
		base: [
			"flex cursor-pointer break-words hover:bg-base-content/5",
			"rounded-lg",
			"transition-colors duration-200",
		],
		active: "bg-primary/10 hover:bg-primary/15",
	},
	preview: {
		container: [
			"relative flex items-center justify-center flex-shrink-0",
			"overflow-hidden rounded-lg",
			"w-50 h-28 aspect-video",
			"before:content-[''] before:absolute before:inset-0 before:bg-black before:rounded-lg",
		],
		skeleton: "relative skeleton w-full h-full rounded-lg",
		imageError: "relative!",
		image: "relative block w-full h-full object-contain",
	},
	duration: {
		container: [
			"absolute bottom-1.5 right-1.5 rounded-lg",
			"px-1.5 py-1",
			"backdrop-blur-xs",
			"text-xs bg-base-100/60 text-base-content/80",
		],
	},
	mark: {
		container: [
			"absolute top-1.5 left-1.5 p-0.5",
			"rounded-lg",
			"bg-base-100/60",
			"backdrop-blur-xs",
		],
		icon: "size-7 drop-shadow-xs/90",
	},
	progress: {
		container: "absolute bottom-0 right-0 w-full h-1",
		bar: "absolute top-0 left-0 w-0 h-full bg-primary opacity-80",
	},
	info: {
		container: "flex flex-col justify-between gap-1 p-2.5 px-4",
		title:
			"text-sm font-medium break-all leading-6 text-base-content line-clamp-3",
		titleActive: "text-primary",
		size: "text-xs text-base-content/60",
	},
};

// 根元素引用
const rootRef = shallowRef<HTMLElement>();

// 预览选项
const previewOptions = computed(() => ({
	pickCode: props.item.pc,
	sha1: props.item.sha,
	coverNum: PLAYLIST_PREVIEW_NUM,
	duration: props.item.play_long,
}));

// 智能预览配置
const smartPreviewConfig = {
	elementRef: rootRef,
};

// 使用智能预览 hook
const { preview } = useSmartPreview(previewOptions, smartPreviewConfig);

// 进度百分比
const progressPercent = computed(() => {
	return props.item.current_time / props.item.play_long;
});

// 播放处理
const handlePlay = (item: Entity.PlaylistItem) => {
	emit("play", item);
};
</script>