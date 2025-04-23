<template>
	<div 
		:class="$style['control-bar']"
		@mouseenter="controls.setIsMouseInControls(true)"
		@mouseleave="controls.setIsMouseInControls(false)"
	>
		<!-- 控制栏渐变 -->
		<div :class="[
			$style['control-bar__bg'],
			{
				[$style['is-visible']]: controls.visible.value
			}
		]"></div>
		<!-- 视频控制栏 -->
		<div 
			:ref="controls.mainRef"
			:class="[
				$style['control-bar__main'],
				{
					[$style['is-visible']]: controls.visible.value
				}
		]">
			<div :class="$style['control-bar__content']">
				<!-- 进度条 -->
				<ProgressBar 
					v-if="canplay"
				/>
				<div :class="$style['control-bar__bar']">
					<div :class="$style['left']">
						<!-- 播放按钮 -->
						<PlayButton v-if="canplay" />
						<!-- 音量控制 -->
						<VolumeControl v-if="canplay" />
						<!-- 时间显示 -->
						<TimeDisplay v-if="canplay" />
					</div>
					<div :class="$style['right']">
						<!-- 倍速控制 -->
						<PlaybackRateButton v-if="canplay" />
						<!-- 字幕控制 -->
						<SubtitleButton v-if="canplay" />
						<!-- 音频 Track -->
						<AudioTrackButton v-if="canplay" />
						<!-- 播放器核心 -->
						<PlayerCoreButton />
						<!-- 画质控制 -->
						<QualityButton />
						<!-- 设置 -->
						<SettingsButton />
						<!-- 画中画 -->
						<PipButton />
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
import { computed } from "vue";
import { usePlayerContext } from "../../hooks/usePlayerProvide";
import AudioTrackButton from "./AudioTrackButton.vue";
import FullscreenButton from "./FullscreenButton.vue";
import PipButton from "./PipButton.vue";
import PlayButton from "./PlayButton.vue";
import PlaybackRateButton from "./PlaybackRateButton.vue";
import PlayerCoreButton from "./PlayerCoreButton.vue";
import ProgressBar from "./ProgressBar.vue";
import QualityButton from "./QualityButton.vue";
import ScrollTip from "./ScrollTip.vue";
import SettingsButton from "./SettingsButton.vue";
import SubtitleButton from "./SubtitleButton.vue";
import TimeDisplay from "./TimeDisplay.vue";
import VolumeControl from "./VolumeControl.vue";
// 视频播放器上下文
const { controls, playerCore } = usePlayerContext();

const canplay = computed(() => {
	return playerCore.value?.canplay;
});
</script>

<style module>
.control-bar {
	pointer-events: auto;
}

.control-bar__bg {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	height: 180px;
	background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAC4CAYAAAAi0IY0AAAAAXNSR0IArs4c6QAAAQxJREFUOE9lyNdHBQAAhfHb3nvvuu2997jNe29TJJEkkkgSSSSJJJJEEkkiifRH5jsP56Xz8PM5gcC/xfCIWBNHxZsESiSaJEokQ4pJpUSaSadEhsmkskw2JXJMLiXyIN8UUKLQFFGi2JRQpaaMEuWmghKVUGWqKVFjgpSoNXVUvWmgRKNpokQztJhWSrSZdkp0mE6qy3RTosf0UqIP+s0AJQbNECWGzQg1asYoMW4mKBGCSTNFiWkzQ4lZM0eFTYQSUTNPiQVYNEuUWIYVWIU1WIcN2IQt2IYd2IU92IcDOIQjOIYTOIUzOIcLuIQruIYbuIU7uIcHeIQneIYXeIU3eIcP+IQv+IYf+P0Dkn4pkUpVXukAAAAASUVORK5CYII=');
	background-repeat: repeat-x;
	background-position: bottom;
	z-index: -1;
	pointer-events: none;
	opacity: 0;
	transition: opacity 0.25s ease;
	&.is-visible {
		opacity: 1;
	}
}

.control-bar__main {
	background: linear-gradient(transparent, rgba(0, 0, 0, 0.75));
	color: #fff;
	z-index: 2;
	opacity: 0;
	transition: all 0.25s ease;
	&.is-visible {
		opacity: 1;
	}
}

.control-bar__content {
	padding: 10px 20px;
}

.control-bar__bar {
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
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: none;
		border: none;
		color: white;
		cursor: pointer;
		padding: 5px;

		svg {
			width: 32px;
			height: 32px;
		}
		
		&:hover {
			opacity: 0.8;
		}
		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}
}
</style> 
