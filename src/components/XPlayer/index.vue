<template>
	<div
		ref="rootRef"
		:class="[$style['x-player'], { 'is-fullscreen': fullscreen.isFullscreen.value }]"
	>
		<!-- SVG滤镜定义，使用v-html渲染 -->
		<div v-html="videoEnhance.renderFilter.value"></div>
		
		<!-- 播放器容器 -->
		<div :class="$style['x-player-container']">
			<!-- 视频容器 -->
			<div
				:class="$style['x-player-video-container']"
			>
				<div 
					ref="playerElementRef"
					:class="$style['x-player-video-player']"
					:style="[
						transform.transformStyle.value,
						videoEnhance.getFilterStyle.value
					]"
				>
				</div>

				<!-- 播放/暂停动画 -->
				<PlayAnimation />

				<!-- 错误提示 -->
				<LoadingError 
					v-if="playerCore?.loadError" 
					:class="$style['x-player-error']" 
					:detail="playerCore?.loadError"
				/>

				<!-- 加载动画 -->
				<Loading v-else-if="playerCore?.isLoading" />

				<!-- 字幕 -->
				<Subtitle />

				<!-- 视频控制栏 -->
				<VideoControls />
			</div>
		</div>

		<!-- 弹出层容器 -->
		<div
			:class="$style['x-player-portal-container']"
			:ref="portalContext.container"
		></div>

		<!-- 状态HUD显示 -->
		<HUD />

		<!-- 调试面板 -->
		<Statistics v-if="statistics?.visible.value" />

		<!-- 恢复容器 -->
		<div
			:class="$style['x-player-resume-container']"
			v-if="source.isInterrupt.value"
		>
			<button @click="source.resumeSource">恢复</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { shallowRef } from "vue";
import VideoControls from "./components/Controls/index.vue";
import HUD from "./components/HUD/index.vue";
import Loading from "./components/Loading/index.vue";
import PlayAnimation from "./components/PlayAnimation/index.vue";
import Subtitle from "./components/Subtitle/index.vue";
import { usePlayerProvide } from "./hooks/usePlayerProvide";
import { usePortalProvider } from "./hooks/usePortal";
import type { XPlayerEmit, XPlayerProps } from "./types";
import "./styles/theme.css";
import LoadingError from "../../components/LoadingError/index.vue";
import Statistics from "./components/Statistics/index.vue";

// 属性
const props = withDefaults(defineProps<XPlayerProps>(), {
	onThumbnailRequest: undefined,
	onSubtitleChange: undefined,
	hlsConfig: () => ({}),
	avPlayerConfig: () => ({}),
});
// 事件
const emit = defineEmits<XPlayerEmit>();
// 根元素
const rootRef = shallowRef<HTMLElement | null>(null);
// 原生视频元素
const playerElementRef = shallowRef<HTMLDivElement | null>(null);
// 弹出层上下文
const portalContext = usePortalProvider();
// 视频播放器上下文
const { fullscreen, source, transform, videoEnhance, playerCore, statistics } =
	usePlayerProvide(
		{
			rootRef,
			playerElementRef,
		},
		props,
		emit,
	);

// 暴露方法
defineExpose({
	togglePlay: playerCore.value?.togglePlay,
	interruptSource: source.interruptSource,
	seekTo: playerCore.value?.seek,
});
</script>

<style module>
.x-player {
	width: 100%;
	height: 100%;
	position: relative;
	background-color: var(--x-player-background-color);
	-webkit-font-smoothing: antialiased;
	* {
		user-select: none;
	}
	&.is-fullscreen {
		width: 100vw;
		height: 100vh;
	}
}

.x-player-container {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.x-player-video-container {
	position: relative;
	z-index: 1;
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	.x-player-video-player {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}
	.x-player-error {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 3;
	}
}

.x-player-portal-container {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
	z-index: 9999;
	> * {
		pointer-events: auto;
	}
}

.x-player-resume-container {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 9999;
	display: flex;
	justify-content: center;
	align-items: center;
	button {
		background-color: var(--x-player-background-color);
		color: var(--x-player-text-color);
		border-radius: 32px;
		padding: 8px 16px;
		font-size: 14px;
		cursor: pointer;
	}
}
</style>
