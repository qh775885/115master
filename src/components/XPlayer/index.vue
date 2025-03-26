<template>
	<div
		ref="rootRef"
		:class="[$style['x-player'], { 'is-fullscreen': fullscreen.isFullscreen.value }]"
	>
		<!-- 播放器容器 -->
		<div :class="$style['x-player-container']">
			<!-- 视频容器 -->
			<div
				:class="$style['x-player-video-container']"
			>
				<!-- 视频元素 -->
				<video
					ref="videoElementRef"
					:key="source.videoKey.value"
					:poster="source.current.value?.poster"
					:muted="volume.muted.value"
					:volume="volume.volume.value / 100"
					:autoplay="playing.autoplay.value"
					:loop="playing.loop.value"
					:controls="false"
					:playsinline="true"
					:webkit-playsinline="true"
					:style="transform.transformStyle.value"
					@click="playing.togglePlay"
				>
					<!-- 字幕 -->
					<template v-if="props.subtitleRenderType === 'native'">
						<track
							v-for="(subtitle, index) in subtitles.list.value"
							:key="index"
							:src="subtitle.url"
							:label="subtitle.label"
							:srclang="subtitle.srclang"
							:kind="subtitle.kind"
							:default="subtitle.default"
						/>
					</template>
				</video>

				<!-- 播放/暂停动画 -->
				<PlayAnimation />

				<!-- 加载动画 -->
				<Loading :show="playing.isLoading.value" />

				<!-- 字幕 -->
				<Subtitle v-if="props.subtitleRenderType === 'custom'" />

				<!-- 视频遮罩 -->
				<div
					:class="$style['x-player-video-mask']"
					ref="videoMaskRef"
					@click="playing.togglePlay"
					@dblclick="fullscreen.toggleFullscreen"
				></div>

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

// 属性
const props = withDefaults(defineProps<XPlayerProps>(), {
	subtitleRenderType: "native",
	onThumbnailRequest: undefined,
	onSubtitleChange: undefined,
});
// 事件
const emit = defineEmits<XPlayerEmit>();
// 根元素
const rootRef = shallowRef<HTMLElement | null>(null);
// 视频元素
const videoElementRef = shallowRef<HTMLVideoElement | null>(null);
// Mask
const videoMaskRef = shallowRef<HTMLDivElement | null>(null);
// 弹出层上下文
const portalContext = usePortalProvider();
// 视频播放器上下文
const { fullscreen, volume, playing, source, subtitles, progress, transform } =
	usePlayerProvide(props, emit, {
		rootRef,
		videoElementRef,
		videoMaskRef,
	});

// 暴露方法
defineExpose({
	togglePlay: playing.togglePlay,
	interruptSource: source.interruptSource,
	seekTo: progress.seekTo,
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
	video {
		width: 100%;
		height: 100%;
		backdrop-filter: saturate(1);
	}
}

.x-player-video-mask {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 2;
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
