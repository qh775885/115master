<template>
	<div 
		class="controls-wrapper"
		v-if="source.list.value.length > 0"
		@mouseenter="controls.setIsMouseInControls(true)"
		@mouseleave="controls.setIsMouseInControls(false)"
	>
		<!-- 控制栏渐变 -->
		<div class="controls-gradient" :class="{ 'is-visible': controls.visible.value }"></div>
		<!-- 视频控制栏 -->
		<div class="video-controls" :class="{ 'is-visible': controls.visible.value }">
			<div class="controls-content">
				<!-- 进度条 -->
				<ProgressBar 
				/>
				<div class="controls-bar">
					<div class="left-controls">
						<!-- 播放按钮 -->
						<PlayButton />
						<!-- 音量控制 -->
						<VolumeControl />
						<!-- 时间显示 -->
						<TimeDisplay />
					</div>
					<div class="right-controls">
						<!-- 倍速控制 -->
						<PlaybackRateButton />
						<!-- 字幕控制 -->
						<SubtitleButton />
						<!-- 画质控制 -->
						<QualityButton />
						<!-- 设置 -->
						<SettingsButton />
						<!-- 画中画 -->
						<PipButton />
						<!-- 剧院模式 -->
						<TheatreButton />
						<!-- 全屏控制 -->
						<FullscreenButton />
					</div>
				</div>
				<!-- 滚动提示 -->
				<ScrollTip />
			</div>
		</div>
		
	</div>
</template>

<script setup lang="ts">
import { usePlayerContext } from "../../hooks/usePlayerProvide";
import FullscreenButton from "./FullscreenButton.vue";
import PipButton from "./PipButton.vue";
import PlayButton from "./PlayButton.vue";
import PlaybackRateButton from "./PlaybackRateButton.vue";
import ProgressBar from "./ProgressBar.vue";
import QualityButton from "./QualityButton.vue";
import ScrollTip from "./ScrollTip.vue";
import SettingsButton from "./SettingsButton.vue";
import SubtitleButton from "./SubtitleButton.vue";
import TheatreButton from "./TheatreButton.vue";
import TimeDisplay from "./TimeDisplay.vue";
import VolumeControl from "./VolumeControl.vue";

// 视频播放器上下文
const { controls, source } = usePlayerContext();
</script>

<style scoped>
.controls-wrapper {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	pointer-events: auto;
}

.controls-gradient {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	height: 180px;
	background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAC4CAYAAAAi0IY0AAAAAXNSR0IArs4c6QAAAQxJREFUOE9lyNdHBQAAhfHb3nvvuu2997jNe29TJJEkkkgSSSSJJJJEEkkiifRH5jsP56Xz8PM5gcC/xfCIWBNHxZsESiSaJEokQ4pJpUSaSadEhsmkskw2JXJMLiXyIN8UUKLQFFGi2JRQpaaMEuWmghKVUGWqKVFjgpSoNXVUvWmgRKNpokQztJhWSrSZdkp0mE6qy3RTosf0UqIP+s0AJQbNECWGzQg1asYoMW4mKBGCSTNFiWkzQ4lZM0eFTYQSUTNPiQVYNEuUWIYVWIU1WIcN2IQt2IYd2IU92IcDOIQjOIYTOIUzOIcLuIQruIYbuIU7uIcHeIQneIYXeIU3eIcP+IQv+IYf+P0Dkn4pkUpVXukAAAAASUVORK5CYII=');
	background-repeat: repeat-x;
	background-position: bottom;
	z-index: 1;
	pointer-events: none;
	opacity: 0;
	transition: opacity 0.3s ease;
}
.controls-gradient.is-visible {
	opacity: 1;
}

.video-controls {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
	color: #fff;
	z-index: 2;
	transform: translateY(calc(100% - 30px));
	opacity: 0.5;
	transition: all 0.3s ease;
}

.video-controls.is-visible {
	transform: translateY(0);
	opacity: 1;
}

.controls-content {
	padding: 10px 20px;
}

.controls-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.left-controls,
.right-controls {
	display: flex;
	align-items: center;
	gap: 10px;
}

button {
	background: none;
	border: none;
	color: white;
	cursor: pointer;
	padding: 5px;
}

button:hover {
	opacity: 0.8;
}

.material-symbols-rounded {
	font-size: 24px;
	color: white;
	font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24;
}

.progress-container {
	position: absolute;
	top: 0;
	left: 20px;
	right: 20px;
	z-index: 3;
}

.progress-container.hide {
	transform: translateY(84px);
}

.controls-buttons {
	margin-top: 40px;
	padding-bottom: 12px;
	transform-origin: bottom;
}

.controls-buttons.hide {
	transform: translateY(84px) scaleX(0);
}

.controls-gradient.hide {
	opacity: 0;
}
</style> 
