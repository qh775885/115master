<template>
	<div
		:class="$style['box']"
		v-show="visible"
		:style="{
			left: `${position}%`,
			transform: `translateX(${previewTransform}px)`
		}"
	>
		<div :class="$style['container']">
			<div 
				:class="$style['image']" 
				ref="thumbnailContainer"
				:style="{
					width: `${DEFAULT_WIDTH}px`,
					height: `${DEFAULT_HEIGHT}px`
				}"
				@mouseenter="isHoveringImage = true"
				@mouseleave="isHoveringImage = false"
				@mouseup="handleThumbnailMouseUp"
			>
				<canvas
					ref="thumbnailCanvas"
					:width="width"
					:height="height"
					:style="{
						width: `${width}px`,
						height: `${height}px`
					}"
				></canvas>
				<div :class="$style['loading']" v-show="loading">
					<Loading/>
				</div>
			</div>
			<div :class="$style['time-box']">
				<div 
					:class="[$style['time-image'], isHoveringImage && thumb.renderImage?.timestamp ? $style['show'] : '']"
				>
					跳至 {{ formatTime(thumb.renderImage?.timestamp || 0) }} 预览时间
				</div>
				<div 
					:class="[$style['time-normal'], isHoveringImage ? '' : $style['show']]"
				>
					{{ formatTime(time) }}
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useElementBounding } from "@vueuse/core";
import { computed, onUnmounted, reactive, ref, shallowRef, watch } from "vue";
import { usePlayerContext } from "../../hooks/usePlayerProvide";
import type { ThumbnailFrame } from "../../types";
import { formatTime } from "../../utils/time";
import Loading from "./Loading.vue";

interface Props {
	visible: boolean;
	position: number;
	time: number;
	progressBarWidth: number;
}

const emit = defineEmits<(e: "seek", time: number) => void>();

const DEFAULT_WIDTH = 250;
const DEFAULT_HEIGHT = 140;
const isHoveringImage = ref(false);

const props = withDefaults(defineProps<Props>(), {});
const { rootProps, source } = usePlayerContext();
const { onThumbnailRequest } = rootProps;
const thumbnailCanvas = shallowRef<HTMLCanvasElement | null>(null);
const thumbnailContainer = shallowRef<HTMLDivElement | null>(null);
const width = shallowRef(DEFAULT_WIDTH);
const height = shallowRef(DEFAULT_HEIGHT);
const lastTimer = shallowRef<NodeJS.Timeout | null>(null);
const thumb = reactive({
	lastHoverTime: -1,
	lastRequestTime: -1,
	renderTime: -1,
	renderImage: null as ThumbnailFrame | null,
});
const ctx = computed(() =>
	thumbnailCanvas.value?.getContext("2d", {
		alpha: false,
		colorSpace: "srgb",
	}),
);
const loading = computed(
	() =>
		thumb.lastRequestTime >= 0 && thumb.lastRequestTime === thumb.lastHoverTime,
);
const thumbnailRect = useElementBounding(thumbnailContainer);

// 计算预览容器的位移，防止超出边界
const previewTransform = computed(() => {
	if (!thumbnailCanvas.value) return -(thumbnailRect.width.value / 2);

	const thumbnailWidth = thumbnailRect.width.value;
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

const updateThumbnail = async (hoverTime: number, isLast: boolean) => {
	if (lastTimer.value) {
		clearTimeout(lastTimer.value);
		lastTimer.value = null;
	}

	// 重置缩略图
	thumb.renderImage = null;

	if (!isLast) {
		lastTimer.value = setTimeout(() => {
			if (hoverTime === thumb.lastHoverTime) {
				updateThumbnail(hoverTime, true);
			}
		}, 300);
	}

	// 尝试从缓存中取, 其实是同步返回
	const cacheImage = await onThumbnailRequest({
		type: "Cache",
		time: hoverTime,
		isLast,
	});
	if (cacheImage) {
		thumb.renderImage = cacheImage;
		thumb.renderTime = hoverTime;

		if (isLast) {
			thumb.lastRequestTime = -1;
		}
		return;
	}

	thumb.lastRequestTime = hoverTime;
	const newImage = await onThumbnailRequest({
		type: "Must",
		time: hoverTime,
		isLast,
	});
	if (!newImage) return;

	// 如果请求时间与最新Hover时间相同，则更新缩略图
	if (hoverTime === thumb.lastHoverTime && isLast) {
		thumb.lastRequestTime = -1;
		thumb.renderImage = newImage;
		thumb.renderTime = hoverTime;
	}
};

// 监听缩略图请求
watch(
	() => [props.visible, props.time],
	async () => {
		if (!onThumbnailRequest) return;
		if (!props.visible || !props.time) {
			thumb.lastHoverTime = -1;
			thumb.renderImage = null;
			return;
		}

		const hoverTime = props.time;
		// 更新 hover 时间
		thumb.lastHoverTime = hoverTime;
		await updateThumbnail(hoverTime, false);
	},
);
// 绘制缩略图
watch(
	() => thumb.renderImage,
	(newVal, oldVal) => {
		if (thumbnailCanvas.value && ctx.value) {
			width.value = newVal?.img.width ?? oldVal?.img.width ?? DEFAULT_WIDTH;
			height.value = newVal?.img.height ?? oldVal?.img.height ?? DEFAULT_HEIGHT;

			// 计算设备像素比
			const dpr = 1; // 固定2x分辨率

			requestAnimationFrame(() => {
				// 重置画布变换以防止叠加效应
				ctx.value.setTransform(1, 0, 0, 1, 0, 0);

				// 清空整个画布
				ctx.value.clearRect(0, 0, width.value * dpr, height.value * dpr);

				// 应用高分辨率缩放
				ctx.value.scale(dpr, dpr);

				// 如果缩略图存在且渲染时间与最新Hover时间相同，则绘制缩略图
				if (newVal && thumb.renderTime === thumb.lastHoverTime) {
					// 实现 contain 模式绘制
					const canvasWidth = width.value;
					const canvasHeight = height.value;
					const imgWidth = newVal.img.width;
					const imgHeight = newVal.img.height;

					// 计算宽高比
					const canvasRatio = canvasWidth / canvasHeight;
					const imgRatio = imgWidth / imgHeight;

					let drawWidth: number;
					let drawHeight: number;
					let offsetX: number;
					let offsetY: number;

					// 根据比例决定如何缩放和定位图像
					if (imgRatio > canvasRatio) {
						// 图像更宽，以宽度为基准
						drawWidth = canvasWidth;
						drawHeight = canvasWidth / imgRatio;
						offsetX = 0;
						offsetY = (canvasHeight - drawHeight) / 2;
					} else {
						// 图像更高，以高度为基准
						drawHeight = canvasHeight;
						drawWidth = canvasHeight * imgRatio;
						offsetX = (canvasWidth - drawWidth) / 2;
						offsetY = 0;
					}

					// 先用黑色背景填充整个画布
					ctx.value.fillStyle = "#000000";
					ctx.value.fillRect(0, 0, canvasWidth, canvasHeight);

					// 绘制缩略图，使用计算出的尺寸和偏移量
					ctx.value.drawImage(
						newVal.img,
						offsetX,
						offsetY,
						drawWidth,
						drawHeight,
					);
				}
			});
		}
	},
);

// 监听源列表
watch([source.list], () => {
	thumb.lastHoverTime = -1;
	thumb.lastRequestTime = -1;
	thumb.renderTime = -1;
	thumb.renderImage = null;
	if (lastTimer.value) {
		clearTimeout(lastTimer.value);
		lastTimer.value = null;
	}
});

// 处理缩略图点击事件
const handleThumbnailMouseUp = (e: MouseEvent) => {
	// 使用缩略图实际对应的时间点进行跳转
	if (thumb.renderImage?.timestamp) {
		e.stopPropagation();
		emit("seek", thumb.renderImage.timestamp);
	}
};

onUnmounted(() => {
	if (lastTimer.value) {
		clearTimeout(lastTimer.value);
		lastTimer.value = null;
	}
});
</script>

<style module>
.box {
	position: absolute;
	bottom: 100%;
	pointer-events: auto;
	will-change: transform;
	padding-bottom: 0;
}

.container {
	display: flex;
	flex-direction: column;
	align-items: center;
}	

.image {
	position: relative;
	z-index: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 16px;
	overflow: hidden;
	box-sizing: border-box;
	background: rgba(0,0,0, 1);
	box-shadow: 0 0 4px 0 rgba(15, 15, 15, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.4);
	pointer-events: auto;
	cursor: pointer;
	transition: transform 0.2s ease, box-shadow 0.2s ease;
	margin-bottom: 10px;
	
	&:hover {
		transform: scale(1.02);
		box-shadow: 0 0 4px 0 rgba(15, 15, 15, 0.8), 0 0 0 2px rgba(255, 255, 255, 0.9);
	}
	
	&:active {
		transform: scale(0.98);
	}
}

.time-box {
	position: relative;
	height: 20px;
	width: 100%;
	overflow: hidden;
	
	.time-normal, 
	.time-image {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 100%;
		text-align: center;
		color: #fff;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.9);
		transition: all .25s ease;
		font-size: 12px;
		opacity: 0;
		line-height: 1.2;
		display: block;
	}

	.time-normal {
		transform: translate(-50%, 150%);
	}

	.time-image {
		transform: translate(-50%, -150%);
		font-weight: bold;
	}

	.time-normal.show, 
	.time-image.show {
		opacity: 1;
		transform: translate(-50%, -50%);
	}
}

.loading {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	border-radius: 16px;
}
</style>
