<template>
	<div
		:class="$style['box']"
		v-show="boxVisible"
		:style="{
			transform: `translateX(${previewTransform}px)`
		}"
	>
		<div :class="$style['container']">
			<div 
				:class="$style['image']" 
				:style="{
					width: `${thumbnailContainerSize.width}px`,
					height: `${thumbnailContainerSize.height}px`
				}"
				@mouseenter="isHoveringImage = true"
				@mouseleave="isHoveringImage = false"
				@mouseup="handleThumbnailMouseUp"
			>
				<canvas
					ref="thumbnailCanvas"
					:width="DEFAULT_WIDTH"
					:height="DEFAULT_HEIGHT"
				></canvas>
				<div :class="$style['loading']" v-show="loading">
					<Loading/>
				</div>
			</div>
			<div :class="$style['time-box']">
				<div 
					:class="[$style['time-image'], isHoveringImage && thumb.renderImage?.frameTime ? $style['show'] : '']"
				>
					跳至 {{ formatTime(thumb.renderImage?.frameTime || 0) }} 预览时间
				</div>
				<div 
					:class="[$style['time-normal'], isHoveringImage ? '' : $style['show']]"
				>
					{{ formatTime(props.time) }}
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	computed,
	nextTick,
	onUnmounted,
	reactive,
	ref,
	shallowRef,
	watch,
} from "vue";
import { getImageResize } from "../../../../utils/image";
import { boundary } from "../../../../utils/number";
import { usePlayerContext } from "../../hooks/usePlayerProvide";
import type { ThumbnailFrame } from "../../types";
import { formatTime } from "../../utils/time";
import Loading from "./Loading.vue";

interface Props {
	// 是否显示
	visible: boolean;
	// 位置 （0-100）
	position: number;
	// 时间
	time: number;
	// 进度条宽度
	progressBarWidth: number;
}

// emit
const emit = defineEmits<(e: "seek", time: number) => void>();
// props
const props = withDefaults(defineProps<Props>(), {});
// context
const { rootProps, source } = usePlayerContext();

/**
 * 计算缩略图高度
 * @param width 宽度
 * @param ratioWidth 比例宽度
 * @param ratioHeight 比例高度
 * @returns 高度
 */
const ratioHeight = (
	width: number,
	ratioWidth: number,
	ratioHeight: number,
) => {
	return (width * ratioHeight) / ratioWidth;
};

// 默认宽度
const DEFAULT_WIDTH = 250;
// 默认高度
const DEFAULT_HEIGHT = ratioHeight(DEFAULT_WIDTH, 16, 9);
// 是否正在悬停
const isHoveringImage = ref(false);
// 绘制缩略图请求
const { onThumbnailRequest } = rootProps;
// 画布
const thumbnailCanvas = shallowRef<HTMLCanvasElement | null>(null);
// 缩略图容器尺寸
const thumbnailContainerSize = shallowRef({
	width: DEFAULT_WIDTH,
	height: DEFAULT_HEIGHT,
});
// 最后一次定时器
const lastTimer = shallowRef<NodeJS.Timeout | null>(null);
// 缩略图
const thumb = reactive({
	// 最后一次 hover 时间
	lastHoverTime: -1,
	// 最后一次请求时间
	lastRequestTime: -1,
	// 渲染时间
	renderTime: -1,
	// 渲染图片
	renderImage: undefined as ThumbnailFrame,
});
// 是否显示
const boxVisible = computed(() => props.visible && previewTransform.value > -1);
// canvas 上下文
const ctx = computed(() =>
	thumbnailCanvas.value?.getContext("2d", {
		alpha: false,
		colorSpace: "srgb",
		desynchronized: true,
	}),
);
// 是否正在加载
const loading = computed(
	() =>
		thumb.lastRequestTime >= 0 && thumb.lastRequestTime === thumb.lastHoverTime,
);
// 预览容器的位移
const previewTransform = shallowRef(-1);

// 计算预览容器的位移，防止超出边界
watch(
	() => [props.position],
	async () => {
		if (!props.visible) {
			previewTransform.value = -1;
			return;
		}

		if (props.progressBarWidth < 0) {
			previewTransform.value = -1;
			return;
		}

		const thumbnailWidth = thumbnailContainerSize.value.width;
		const offsetCenter = -(thumbnailWidth / 2);
		const offsetX = props.progressBarWidth * (props.position / 100);
		const offset = offsetCenter + offsetX;
		const min = 0;
		const max = props.progressBarWidth - thumbnailWidth;
		const result = boundary(offset, min, max);
		previewTransform.value = result;
	},
);

// 更新缩略图
const updateThumbnail = async (hoverTime: number, isLast: boolean) => {
	if (lastTimer.value) {
		clearTimeout(lastTimer.value);
		lastTimer.value = null;
	}

	// 重置缩略图
	thumb.renderImage = undefined;

	if (!isLast) {
		lastTimer.value = setTimeout(() => {
			if (hoverTime === thumb.lastHoverTime) {
				updateThumbnail(hoverTime, true);
			}
		}, 50);
	}

	// 尝试从缓存中取, 其实是同步返回
	const cacheImage = await onThumbnailRequest?.({
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
	const newImage = await onThumbnailRequest?.({
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
			thumb.renderImage = undefined;
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
	(newVal) => {
		if (thumbnailCanvas.value && ctx.value) {
			requestAnimationFrame(() => {
				if (!ctx.value) {
					throw new Error("ctx not found");
				}

				// 清空整个画布
				ctx.value.clearRect(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT);

				// 如果缩略图存在且渲染时间与最新Hover时间相同，则绘制缩略图
				if (newVal && thumb.renderTime === thumb.lastHoverTime) {
					const imgWidth = newVal.img.width;
					const imgHeight = newVal.img.height;
					const { width: resizeWidth, height: resizeHeight } = getImageResize(
						imgWidth,
						imgHeight,
						DEFAULT_WIDTH,
						DEFAULT_HEIGHT,
					);
					const dx = (DEFAULT_WIDTH - resizeWidth) / 2;
					const dy = (DEFAULT_HEIGHT - resizeHeight) / 2;
					ctx.value.fillStyle = "#000";
					ctx.value.fillRect(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT);
					ctx.value.drawImage(newVal.img, dx, dy, resizeWidth, resizeHeight);
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
	thumb.renderImage = undefined;
	if (lastTimer.value) {
		clearTimeout(lastTimer.value);
		lastTimer.value = null;
	}
});

// 处理缩略图点击事件
const handleThumbnailMouseUp = (e: MouseEvent) => {
	// 使用缩略图实际对应的时间点进行跳转
	if (thumb.renderImage?.frameTime) {
		e.stopPropagation();
		emit("seek", thumb.renderImage.frameTime);
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
