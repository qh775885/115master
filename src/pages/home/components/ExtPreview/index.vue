<template>
	<div :class="styles.container.main" ref="rootRef">
		<div :class="styles.container.content">
			<!-- 错误状态 -->
			<div :class="styles.states.error" v-if="preview.error">
				<LoadingError size="mini" :message="preview.error" />
			</div>
			
			<!-- 加载骨架 -->
			<template v-else-if="preview.isLoading">
				<div :class="styles.skeleton"></div>
			</template>
			
			<!-- 预览内容 -->
			<div
				v-else-if="preview.isReady"
				class="pswp-gallery"
				:class="styles.preview.container"
				:id="`gallery-${props.pickCode}`"
			>
				<a 
					v-for="(thumbnail, index) in preview.state"
					:key="index"
					:class="[styles.preview.thumbItem]"
					@click.prevent.stop="openPhotoSwipe(index)"
				>
					<img 
						:src="thumbnail.img" 
						:alt="`预览图 ${index + 1}`"
						:class="styles.preview.thumbImage"
					/>
				</a>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import PhotoSwipeLightbox from "photoswipe/lightbox";
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import LoadingError from "../../../../components/LoadingError/index.vue";
import "photoswipe/style.css";
import { FRIENDLY_ERROR_MESSAGE } from "../../../../constants";
import { useSmartPreview } from "../../../../hooks/usePreview";
import { Drive115Error } from "../../../../utils/drive115/core";
// 文件列表预览封面数量
const FILELIST_PREVIEW_NUM = 5;

// 样式常量定义
const styles = {
	// 容器样式
	container: {
		main: "w-full max-w-214 px-20 h-24 [content-visibility:auto]",
		content:
			"relative h-full flex items-center bg-base-300 rounded overflow-hidden",
	},
	// 状态样式
	states: {
		error: "flex items-center justify-center flex-1",
	},
	// 骨架样式
	skeleton: "skeleton w-full h-full rounded",
	// 预览样式
	preview: {
		container: [
			"w-full h-full flex overflow-hidden select-none overflow-hidden",
		],
		thumbItem: [
			"h-full aspect-video",
			"overflow-hidden",
			"cursor-zoom-in no-underline",
			"hover:opacity-90 transition-opacity",
		],
		thumbImage: ["h-full w-full object-contain object-center align-top"],
	},
};

const props = defineProps<{
	pickCode: string;
	sha1: string;
	duration: number | string;
	listScrollBoxNode: HTMLElement;
}>();

// 根元素引用
const rootRef = ref<HTMLElement>();
// PhotoSwipe 实例
const lightbox = ref<PhotoSwipeLightbox | null>(null);

// 滚动目标 ref（用于 useScroll）
const scrollTargetRef = computed(() => props.listScrollBoxNode);

// 预览选项
const previewOptions = computed(() => ({
	sha1: props.sha1,
	pickCode: props.pickCode,
	coverNum: FILELIST_PREVIEW_NUM,
	duration: Number(props.duration),
}));

// 智能预览配置
const smartPreviewConfig = {
	elementRef: rootRef,
	scrollTarget: scrollTargetRef,
};

// 使用智能预览 hook
const { preview } = useSmartPreview(previewOptions, smartPreviewConfig);

// 初始化 PhotoSwipe
const initPhotoSwipe = () => {
	if (lightbox.value) {
		lightbox.value.destroy();
		lightbox.value = null;
	}

	lightbox.value = new PhotoSwipeLightbox({
		dataSource: preview.state.map((item) => ({
			src: item.img,
			width: item.width,
			height: item.height,
			alt: "预览图",
		})),
		showHideAnimationType: "fade",
		pswpModule: () => import("photoswipe"),
		mouseMovePan: true,
		initialZoomLevel: "fit",
		secondaryZoomLevel: 2,
		maxZoomLevel: 4,
		wheelToZoom: true,
		bgOpacity: 0.9,
	});

	lightbox.value.init();
};

// 打开 PhotoSwipe
const openPhotoSwipe = (index: number) => {
	if (!lightbox.value || !preview.isReady) return;
	lightbox.value.loadAndOpen(index);
};

// 监听有效图片变化，初始化 PhotoSwipe
watch(
	() => preview.isReady,
	async (isReady) => {
		if (isReady) {
			await nextTick();
			initPhotoSwipe();
		}
	},
);

// 组件销毁时清理
onBeforeUnmount(() => {
	if (lightbox.value) {
		lightbox.value.destroy();
		lightbox.value = null;
	}
});
</script>