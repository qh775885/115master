<template>
	<div :class="$style['ext-preview']" ref="rootRef">
		<LoadingError v-if="videoData.error.value" style="margin: 0 auto" :detail="videoData.error.value" />
		<Skeleton v-else-if="videoData.isLoading.value" mode="light" width="100%" height="100%" border-radius="0"  />	
		<div
			v-else
			ref="videoRef"
			class="pswp-gallery" 
			:class="$style['ext-preview-video']"
			:id="`gallery-${props.pickCode}`"
		>
			<a 
				v-for="(thumbnail, index) in videoData.state.value"
				:key="index"
				:class="$style['thumb-item']"
				@click.prevent.stop="openPhotoSwipe(index)"
			>
				<img 
					:src="thumbnail?.img" 
					:alt="`预览图 ${index + 1}`"
				/>
			</a>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useElementVisibility } from "@vueuse/core";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import LoadingError from "../../../../components/LoadingError/index.vue";
import Skeleton from "../../../../components/Skeleton/index.vue";
import "photoswipe/style.css";
import { usePreview } from "../../../../hooks/usePreview";
import { FILELIST_PREVIEW_NUM } from "../../../../utils/cache/core/const";
const props = defineProps<{
	pickCode: string;
	sha1: string;
	duration: number;
}>();

const rootRef = ref<HTMLElement>();
const rootVisibilityRef = useElementVisibility(rootRef, {
	threshold: 0.3,
});
const videoRef = ref<HTMLElement>();
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
	() => rootVisibilityRef.value,
	(visible) => {
		if (visible) {
			videoData.execute(0, {
				sha1: props.sha1,
				pickCode: props.pickCode,
				coverNum: FILELIST_PREVIEW_NUM,
				duration: props.duration,
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

<style module>
.ext-preview {
	width: 100%;
	height: 100px;
	display: flex;
	align-items: center;
	box-sizing: border-box;
	.ext-preview-video {
		height: 100%;
		display: flex;
		justify-content: center;
		overflow: hidden;
		overflow-x: auto;
		gap: 8px;

		/* 优化滚动条样式 */
		&::-webkit-scrollbar {
			height: 0; /* 减小滚动条高度 */
			width: 0;
		}

		.thumb-item {
			aspect-ratio: 16 / 9;
			height: 100px;
			cursor: zoom-in;
			text-decoration: none;
			background-color: #aaa;
			overflow: hidden;
			border-radius: 8px;

			&:hover {
				opacity: 0.9;
			}

			img {
				height: 100%;
				width: 100%;
				object-fit: contain;
				object-position: center;
				vertical-align: top;
			}
		}
	}
}
</style>