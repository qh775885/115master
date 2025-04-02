<template>
	<div 
		:class="$style['controls-wrapper']"
		v-if="source.list.value.length > 0"
		@mouseenter="controls.setIsMouseInControls(true)"
		@mouseleave="controls.setIsMouseInControls(false)"
	>
		<!-- 控制栏渐变 -->
		<div :class="[
			$style['controls-bg'],
			{
				[$style['is-visible']]: controls.visible.value
			}
		]"></div>
		<!-- 视频控制栏 -->
		<div 
			:ref="controls.mainRef"
			:class="[
				$style['controls-main'],
				{
					[$style['is-visible']]: controls.visible.value
				}
		]">
			<div :class="$style['controls-content']">
				<!-- 进度条 -->
				<ProgressBar 
				/>
				<div :class="$style['controls-bar']">
					<div :class="$style['left']">
						<!-- 播放按钮 -->
						<PlayButton />
						<!-- 音量控制 -->
						<VolumeControl />
						<!-- 时间显示 -->
						<TimeDisplay />
					</div>
					<div :class="$style['right']">
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
						<!-- 播放列表 -->
						<PlaylistButton />
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
import PlaylistButton from "./PlaylistButton.vue";
import ProgressBar from "./ProgressBar.vue";
import QualityButton from "./QualityButton.vue";
import ScrollTip from "./ScrollTip.vue";
import SettingsButton from "./SettingsButton.vue";
import SubtitleButton from "./SubtitleButton.vue";
import TimeDisplay from "./TimeDisplay.vue";
import VolumeControl from "./VolumeControl.vue";

// 视频播放器上下文
const { controls, source } = usePlayerContext();
</script>

<style module>
.controls-wrapper {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	pointer-events: auto;
	z-index: 3;
}

.controls-bg {
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
	transition: opacity 0.25s ease;
	&.is-visible {
		opacity: 1;
	}
}

.controls-main {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	background: linear-gradient(transparent, rgba(0, 0, 0, 0.75));
	color: #fff;
	z-index: 2;
	opacity: 0;
	transition: all 0.25s ease;
	&.is-visible {
		opacity: 1;
	}
}

.controls-content {
	padding: 10px 20px;
}

.controls-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	.left,
	.right {
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
}
</style> 
