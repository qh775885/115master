<template>
	<div :class="$style['playlist']">
		<div 
			:class="$style['playlist__header']" 
			@click="handleClose"
			>
			<div :class="$style['playlist__header-title']" @click.stop="handleTitleClick" :title="'点击滚动到当前播放项'">
				<Icon :svg="SubscriptionSvg" size="24" />
				播放列表
				<span :class="$style['playlist__header-title-count']">({{ playlist.state.length }})</span>
			</div>

			<Icon :class="$style['playlist__header-close']" :svg="CloseSvg" size="30" />
		</div>

		<div :class="$style['playlist__list']" v-if="playlist.error">
			<LoadingError :detail="playlist.error"></LoadingError>
		</div>
		<div :class="$style['playlist__list']" v-else-if="playlist.isLoading || (!playlist.isLoading && !playlist.isReady)">
			<Skeleton width="100%" height="94.5px" border-radius="8px" />
		</div>
		
		<div 
			v-else
			ref="playlistRef"
			:class="$style['playlist__list']"
		>
			<PlaylistItem
				v-for="item in playlist.state"
				ref="playlistItemRefs"
				:key="item.pc"
				:item="item"
				:active="item.pc === pickCode"
				@play="handlePlay"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import SubscriptionSvg from "@material-symbols/svg-400/rounded/subscriptions.svg?component";
import CloseSvg from "@material-symbols/svg-400/rounded/unfold_less-fill.svg?component";
import { nextTick, ref, shallowRef, useTemplateRef, watch } from "vue";
import Icon from "../../../../components/Icon/index.vue";
import LoadingError from "../../../../components/LoadingError/index.vue";
import Skeleton from "../../../../components/Skeleton/index.vue";
import type { Entity } from "../../../../utils/drive115";
import type { useDataPlaylist } from "../../data/useDataPlaylist";
import PlaylistItem from "./item.vue";
import type PlaylistItemVue from "./item.vue";

const props = defineProps<{
	playlist: ReturnType<typeof useDataPlaylist>;
	pickCode: string | null;
}>();

const emit = defineEmits<{
	(e: "play", item: Entity.PlaylistItem): void;
	(e: "close"): void;
}>();

const playlistRef = ref<HTMLElement | null>(null);
const playlistItemRefs =
	useTemplateRef<InstanceType<typeof PlaylistItemVue>[]>("playlistItemRefs");
const initedScroll = shallowRef(false);

const handlePlay = (item: Entity.PlaylistItem) => {
	if (item.pc === props.pickCode) {
		return;
	}
	emit("play", item);
};

/**
 * 滚动到激活的项目
 */
const scrollToActiveItem = async (withAnimation = true) => {
	if (initedScroll.value) return;
	await nextTick();

	if (!playlistItemRefs.value) return;

	// 查找激活的项目
	const activeItem = playlistItemRefs.value.find((ref) => ref.$props.active);
	if (!activeItem || !playlistRef.value) return;

	// 获取激活项目元素与容器
	const activeElement = activeItem.$el;
	const container = playlistRef.value;

	// 基本位置计算
	const elementTop = activeElement.offsetTop;
	const elementHeight = activeElement.offsetHeight;
	const containerHeight = container.clientHeight;
	const containerScrollTop = container.scrollTop;

	// 检查元素是否已完全在可视区域内
	const elementBottom = elementTop + elementHeight;
	const isFullyVisible =
		elementTop >= containerScrollTop &&
		elementBottom <= containerScrollTop + containerHeight;

	// 如果元素已完全可见且不是手动触发，则不滚动
	if (isFullyVisible && !withAnimation) {
		return;
	}

	// 计算居中位置
	const scrollTop = elementTop - (containerHeight - elementHeight) / 2;

	// 执行滚动
	container.scrollTo({
		top: Math.max(0, scrollTop),
		behavior: withAnimation ? "smooth" : "instant",
	});

	initedScroll.value = true;
};

// 点击标题时调用的滚动函数
const handleTitleClick = () => {
	scrollToActiveItem(true);
};

const handleClose = () => {
	emit("close");
};

// 监听 pickCode 的变化，滚动到激活的项目
watch(
	[() => props.playlist.state, () => props.pickCode],
	() => scrollToActiveItem(false),
	{
		immediate: true,
	},
);
</script>

<style module>
.playlist {
	--x-playlist-header-height: 68px;
	position: relative;
	display: flex;
	flex-direction: column;
	background-color: rgba(0,0,0, 0.9);
	color: #fff;
    box-sizing: border-box;
    border-radius: 16px;
    z-index: 1;
	overflow: hidden;
}

.playlist__header {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	z-index: 2;
	font-size: 20px;
	color: #eee;
	padding: 0 28px;
	height: var(--x-playlist-header-height);
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: space-between;
	user-select: none;
	background-color: rgba(0,0,0, 0.8);
	cursor: pointer;
	backdrop-filter: blur(20px) saturate(180%);
}

.playlist__header-title {
	display: flex;
	align-items: center;
	gap: 8px;
	transition: color 0.2s ease;
}

.playlist__header-title-count {
	font-size: 12px;
	color: #aaa;
}

.playlist__header-close {
	transition: color 0.2s ease;
	fill: #f1f1f1;
}

.playlist__list {
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: calc(var(--x-playlist-header-height) + 12px) 16px 20px;
	overflow-y: auto;
}

/* 自定义滚动条样式 */
.playlist__list::-webkit-scrollbar {
	width: 6px;
}

.playlist__list::-webkit-scrollbar-track {
	background: transparent;
}

.playlist__list::-webkit-scrollbar-thumb {
	background-color: rgba(255, 255, 255, 0.2);
	border-radius: 3px;
}

.playlist__list::-webkit-scrollbar-thumb:hover {
	background-color: rgba(255, 255, 255, 0.3);
}
</style>