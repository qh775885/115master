<template>
	<div
		class="preview-container"
		v-show="visible"
		:style="{
			left: `${position}%`,
			transform: `translateX(${previewTransform}px)`
		}"
	>
		<div class="thumbnail-container">
			<canvas
				ref="thumbnailCanvas"
				:width="width"
				:height="height"
			></canvas>
			<div class="thumbnail-loading" v-show="loading">
				<Loading/>
			</div>
		</div>
		<div class="time-tooltip">
			{{ formatTime(time) }}
		</div>
	</div>
</template>

<script setup lang="ts">
import { refDebounced } from "@vueuse/core";
import { throttle } from "lodash";
import { computed, reactive, ref, watch } from "vue";
import { usePlayerContext } from "../../hooks/usePlayer";
import { formatTime } from "../../utils/time";
import Loading from "./Loading.vue";

interface Props {
	visible: boolean;
	position: number;
	time: number;
	progressBarWidth: number;
}

const props = withDefaults(defineProps<Props>(), {});
const { rootProps, source } = usePlayerContext();
const { onThumbnailRequest } = rootProps;
const thumbnailCanvas = ref<HTMLCanvasElement | null>(null);
const ctx = computed(() => thumbnailCanvas.value?.getContext("2d"));
const width = computed(() => thumb.renderImage?.width ?? 320);
const height = computed(() => thumb.renderImage?.height ?? 180);
const thumb = reactive({
	lastHoverTime: -1,
	lastRequestTime: -1,
	renderTime: -1,
	renderImage: null as ImageBitmap | null,
});
const loading = computed(
	() =>
		thumb.lastRequestTime >= 0 && thumb.lastRequestTime === thumb.lastHoverTime,
);
const loadingDebounce = refDebounced(loading, 30);

// 计算预览容器的位移，防止超出边界
// 计算预览容器的位移，防止超出边界
const previewTransform = computed(() => {
	if (!thumbnailCanvas.value) return -(width.value / 2);

	const thumbnailWidth = width.value;
	const centerOffset = props.progressBarWidth * (props.position / 100);

	// 如果缩略图会超出左边界
	if (centerOffset < thumbnailWidth / 2) {
		return -centerOffset;
	}

	// 如果缩略图会超出右边界
	if (centerOffset > props.progressBarWidth - thumbnailWidth / 2) {
		return -(thumbnailWidth - (props.progressBarWidth - centerOffset));
	}

	// 正常情况，缩略图居中显示
	return -(thumbnailWidth / 2);
});

const requestThumbnail = throttle(
	async () => {
		if (thumb.lastHoverTime === -1) return;

		const requestTime = thumb.lastHoverTime;
		thumb.lastRequestTime = requestTime;
		const image = await onThumbnailRequest("Must", requestTime);
		if (!image) return;

		// 如果请求时间与最新Hover时间相同，则更新缩略图
		if (requestTime === thumb.lastHoverTime) {
			thumb.lastRequestTime = -1;
			thumb.renderImage = image;
			thumb.renderTime = requestTime;
		}
	},
	300,
	{
		trailing: true,
	},
);

watch(
	() => [props.visible, props.time],
	async () => {
		if (!props.visible || !props.time) {
			thumb.lastHoverTime = -1;
			thumb.renderImage = null;
			return;
		}

		if (!onThumbnailRequest) return;

		thumb.lastHoverTime = props.time;
		thumb.renderImage = null;
		const cacheImage = await onThumbnailRequest("Cache", thumb.lastHoverTime); // 尝试从缓存中取, 其实是同步返回
		if (cacheImage) {
			thumb.renderImage = cacheImage;
			thumb.renderTime = thumb.lastHoverTime;
		} else {
			requestThumbnail();
		}
	},
);

// 绘制缩略图
watch(
	() => thumb.renderImage,
	(newVal) => {
		if (thumbnailCanvas.value && ctx.value) {
			requestAnimationFrame(() => {
				ctx.value.fillRect(0, 0, width.value, height.value);
				if (newVal) {
					ctx.value.drawImage(newVal, 0, 0, width.value, height.value);
				}
			});
		}
	},
);

watch([source.list], () => {
	thumb.lastHoverTime = -1;
	thumb.lastRequestTime = -1;
	thumb.renderTime = -1;
	thumb.renderImage = null;
});
</script>

<style scoped>
.preview-container {
	position: absolute;
	bottom: 100%;
	margin-bottom: 10px;
	pointer-events: none;
	will-change: transform;
}

.thumbnail-container {
	position: relative;
	border-radius: 12px;
	overflow: hidden;
	box-shadow: 0 2px 8px rgba(15, 15, 15, 0.7);
	canvas {
		background: rgba(15, 15, 15, 0.9);
		border-radius: 12px;
	}
}

.time-tooltip {
	text-align: center;
	margin-top: 4px;
	color: #fff;
	text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.thumbnail-loading {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	border-radius: 12px;
}
</style>
