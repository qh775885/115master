<template>
	<div :class="styles.container.main" ref="rootRef">
		<div :class="styles.container.content">
			<!-- 错误状态 -->
			<div :class="styles.states.error" v-if="videoData.error.value">
				<LoadingError size="mini" :detail="videoData.error.value" fold />
			</div>
			
			<!-- 加载骨架 -->
			<template v-else-if="videoData.isLoading.value">
				<div :class="styles.skeleton"></div>
			</template>
			
			<!-- 预览内容 -->
			<div
				v-else
				class="pswp-gallery"
				:class="styles.preview.container"
				:id="`gallery-${props.pickCode}`"
			>
				<a 
					v-for="(thumbnail, index) in videoData.state.value"
					:key="index"
					:class="[styles.preview.thumbItem]"
					@click.prevent.stop="openPhotoSwipe(index)"
				>
					<img 
						:src="thumbnail?.img" 
						:alt="`预览图 ${index + 1}`"
						:class="styles.preview.thumbImage"
					/>
				</a>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { refDebounced, useElementVisibility } from "@vueuse/core";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import LoadingError from "../../../../components/LoadingError/index.vue";
import "photoswipe/style.css";
import { usePreview } from "../../../../hooks/usePreview";
import { FILELIST_PREVIEW_NUM } from "../../../../utils/cache/core/const";

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
	// 骨架样
	skeleton: "skeleton w-full h-full rounded",
	// 预览样式
	preview: {
		container: ["h-full flex overflow-hidden select-none overflow-hidden"],
		thumbItem:
			"aspect-video h-full cursor-zoom-in no-underline overflow-hidden hover:opacity-90 transition-opacity",
		thumbImage: ["h-full w-full object-contain object-center align-top"],
	},
};

const props = defineProps<{
	pickCode: string;
	sha1: string;
	duration: number | string;
}>();

const rootRef = ref<HTMLElement>();
const rootVisibilityRef = useElementVisibility(rootRef);
const rootVisibilityDebouncedRef = refDebounced(rootVisibilityRef, 150);
const lightbox = ref<PhotoSwipeLightbox | null>(null);

// 初始化 PhotoSwipe
const initPhotoSwipe = () => {
	if (lightbox.value) {
		lightbox.value.destroy();
		lightbox.value = null;
	}

	lightbox.value = new PhotoSwipeLightbox({
		dataSource:
			videoData.state.value
				?.filter((item) => item !== null)
				.map((item) => ({
					src: item?.img ?? "",
					width: item?.width ?? 0,
					height: item?.height ?? 0,
					alt: "预览图",
				})) || [],
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
	if (!lightbox.value || !videoData.state.value?.length) return;
	lightbox.value.loadAndOpen(index);
};

const videoData = usePreview();

// 监听元素可见性
watch(
	() => rootVisibilityDebouncedRef.value,
	(visible) => {
		if (
			visible &&
			!videoData.state.value?.length &&
			!videoData.isLoading.value &&
			!videoData.error.value
		) {
			videoData.execute(0, {
				sha1: props.sha1,
				pickCode: props.pickCode,
				coverNum: FILELIST_PREVIEW_NUM,
				duration: Number(props.duration),
			});
		}
	},
);

// 监听数据变化，初始化 PhotoSwipe
watch(
	() => videoData.state.value,
	async (newValue) => {
		if (newValue && newValue?.length > 0) {
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