<template>
    <div 
		ref="rootRef"
		:class="[$style['playlist-item'],{ [$style['active']]: props.active }]"
        @click="handlePlay(item)"
    >
		<div :class="$style['playlist-item__preview']">
			<LoadingError v-if="preview.error.value"
				:detail="preview.error.value"
				size="mini"
			/>

			<Skeleton v-else-if="preview.isLoading.value" 
				width="100%"
				height="100%"
				border-radius="8px"
			/>
			
			<img v-else :src="previewImg" />

			<!-- 时长 -->
			<div :class="$style['playlist-item__duration']">
				{{ formatTime(item.play_long) }}
			</div>

			<!-- 收藏 -->
			<div :class="$style['playlist-item__mark']" v-if="item.m">
				<Icon :class="$style['playlist-item__mark-icon']" :svg="StarFillSvg" />
			</div>

			<!-- 进度条 -->
			<div :class="$style['playlist-item__progress']" v-if="item.current_time > 0">
				<div :class="$style['playlist-item__progress-bar']" :style="{ width: `${progressPercent * 100}%` }"></div>
			</div>
		</div>
        <div :class="$style['playlist-item__info']">
			<!-- 标题 -->
			<div :class="$style['playlist-item__title']">
				{{ item.n }}
			</div>
			<!-- 大小 -->
			<div :class="$style['playlist-item__size']">
				{{ formatFileSize(item.s) }}
			</div>
		</div>
    </div>
</template>

<script setup lang="ts">
import StarFillSvg from "@material-symbols/svg-400/rounded/star-fill.svg?component";
import { useElementVisibility } from "@vueuse/core";
import { computed, shallowRef, watch } from "vue";
import Icon from "../../../../components/Icon/index.vue";
import LoadingError from "../../../../components/LoadingError/index.vue";
import Skeleton from "../../../../components/Skeleton/index.vue";
import { formatTime } from "../../../../components/XPlayer/utils/time";
import { usePreview } from "../../../../hooks/usePreview";
import type { Entity } from "../../../../utils/drive115";
import { formatFileSize } from "../../../../utils/format";

const props = defineProps<{
	item: Entity.PlaylistItem;
	active: boolean;
}>();

const emit = defineEmits<{
	play: [Entity.PlaylistItem];
}>();

// 根元素
const rootRef = shallowRef<HTMLElement>();
// 元素可见性
const visibilityRef = useElementVisibility(rootRef, {
	threshold: 0.3,
});
// 预览
const preview = usePreview();
// 预览图片
const previewImg = computed(() => {
	return preview.state.value?.[0]?.img ?? "";
});
// 进度
const progressPercent = computed(() => {
	return props.item.current_time / props.item.play_long;
});

// 播放
const handlePlay = (item: Entity.PlaylistItem) => {
	emit("play", item);
};

// 监听元素可见性
watch(visibilityRef, (newValue) => {
	if (newValue) {
		preview.execute(0, props.item.pc, props.item.pc);
	}
});
</script>

<style module>
.playlist-item {
	display: flex;
	transition: background-color 0.2s ease;
	cursor: pointer;
	word-wrap: break-word;
	gap: 8px;
	&.active {
		.playlist-item__title {
			color: var(--color-primary);
		}
	}
}

.playlist-item__preview {
	position: relative;
	width: 168px;
	height: 94.5px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	border-radius: 8px;
	overflow: hidden;
	img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
		background-color: #f1f1f1;
	}
}

.playlist-item__duration {
	position: absolute;
	bottom: 6px;
	right: 6px;
	font-size: 12px;
	font-weight: bold;
	background-color: rgba(0, 0, 0, 0.6);
	padding: 2px 4px;
	border-radius: 4px;
}

.playlist-item__mark {
	position: absolute;
	top: 6px;
	left: 6px;
	background-color: rgba(0, 0, 0, 0.6);
	padding: 2px;
	border-radius: 4px;
	.playlist-item__mark-icon {
		display: block;
		width: 14px;
		height: 14px;
		
	}
}

.playlist-item__progress {
	position: absolute;
	bottom: 0;
	right: 0;
	width: 100%;
	height: 3px;
	background-color: rgba(0, 0, 0, 0.6);
	box-shadow: 0 -1px 4px 0 rgba(0, 0, 0, 0.3);
	.playlist-item__progress-bar {
		position: absolute;
		top: 0;
		left: 0;
		width: 0;
		height: 100%;
		background-color: var(--color-primary);
		opacity: 0.8;
	}
}

.playlist-item__info {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	gap: 4px;
}

.playlist-item__title {
	font-size: 14px;
	font-weight: 500;
	word-break: break-all;
	line-height: 1.5;
	color: #f1f1f1;
}

.playlist-item__size {
	font-size: 12px;
	color: #aaa;
}
</style>