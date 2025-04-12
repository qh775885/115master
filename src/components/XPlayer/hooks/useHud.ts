import FastForwardSvg from "@material-symbols/svg-400/rounded/fast_forward.svg";
import FastRewindSvg from "@material-symbols/svg-400/rounded/fast_rewind.svg";
import FlipSvg from "@material-symbols/svg-400/rounded/flip.svg";
import LocationOnSvg from "@material-symbols/svg-400/rounded/location_on.svg";
import RocketLaunchSvg from "@material-symbols/svg-400/rounded/rocket_launch.svg";
import RotateSvg from "@material-symbols/svg-400/rounded/rotate_right.svg";
import SubtitlesSvg from "@material-symbols/svg-400/rounded/subtitles.svg";
import SubtitlesOffSvg from "@material-symbols/svg-400/rounded/subtitles_off.svg";
import TimerSvg from "@material-symbols/svg-400/rounded/timer.svg";
import VolumeDownSvg from "@material-symbols/svg-400/rounded/volume_down.svg";
import VolumeOffSvg from "@material-symbols/svg-400/rounded/volume_off.svg";
import VolumeUpSvg from "@material-symbols/svg-400/rounded/volume_up.svg";

import { computed, onUnmounted, shallowRef, watch } from "vue";
import type { HudMessage } from "../components/HUD/index";
import { formatTime } from "../utils/time";
import type { PlayerContext } from "./usePlayerProvide";

// 消息持续时间选项
const DurationOptions = {
	// 快速
	Fast: 500,
	// 正常
	Normal: 1500,
	// 长
	Long: 2000,
};

/**
 * HUD消息管理
 */
export const useHud = (ctx: PlayerContext) => {
	// 当前消息 - 只保留一条最新消息
	const currentMessage = shallowRef<HudMessage | null>(null);
	// 超时ID
	let timeoutId: number | null = null;

	// 消息数组 - 计算属性，始终只包含当前消息（如果有）
	const messages = computed(() => {
		return currentMessage.value ? [currentMessage.value] : [];
	});

	// 显示消息
	const show = (message: Omit<HudMessage, "timestamp">) => {
		const timestamp = Date.now();
		const duration = message.duration || DurationOptions.Normal;

		// 清除之前的超时
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}

		// 直接设置新消息
		currentMessage.value = {
			...message,
			timestamp,
		};

		// 设置定时器，自动移除消息
		timeoutId = window.setTimeout(() => {
			currentMessage.value = null;
			timeoutId = null;
		}, duration);
	};

	// 清空消息
	const clear = () => {
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
		currentMessage.value = null;
	};

	// 获取当前播放进度百分比
	const getCurrentProgressPercentage = () => {
		if (!ctx.playerCore.value) return 0;

		return ctx.playerCore.value.duration > 0
			? (ctx.playerCore.value.currentTime / ctx.playerCore.value.duration) * 100
			: 0;
	};

	// 显示进度跳转HUD
	const showProgressJump = (digit: number) => {
		// 计算百分比
		const percentage = digit / 10;

		// 计算百分比对应的时间
		const targetTime = percentage * (ctx.playerCore.value?.duration || 0);
		const minutes = Math.floor(targetTime / 60);
		const seconds = Math.floor(targetTime % 60);
		const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;

		// 显示HUD
		show({
			title: digit === 0 ? "跳转到开头" : `跳转到 ${digit}0%`,
			data: {
				icon: LocationOnSvg,
				value: timeString,
				max: 100,
				min: 0,
				progress: percentage * 100,
			},
		});
	};

	// 显示音量
	const showVolume = () => {
		let icon = VolumeUpSvg;
		const value = ctx.playerCore.value?.volume;

		if (value === undefined) return;

		if (value < 66) {
			icon = VolumeDownSvg;
		}

		show({
			title: "音量",
			data: {
				icon,
				value,
				max: 100,
				min: 0,
			},
		});
	};

	// 显示静音
	const showMute = () => {
		const muted = ctx.playerCore.value?.muted;
		const icon = muted ? VolumeOffSvg : VolumeUpSvg;
		const value = muted ? "静音" : "取消静音";
		show({
			data: {
				icon,
				value,
			},
		});
	};

	// 显示播放速度
	const showPlaybackRate = () => {
		if (!ctx.playbackRate) return;
		const { current } = ctx.playbackRate;
		show({
			title: "播放速度",
			data: {
				icon: TimerSvg,
				value: current.value,
			},
		});
	};

	// 监听字幕变化
	if (ctx.subtitles) {
		const { current } = ctx.subtitles;
		watch(current, (newSubtitle) => {
			const value = newSubtitle ? newSubtitle.label : "关闭";
			const icon = newSubtitle ? SubtitlesSvg : SubtitlesOffSvg;
			show({
				title: "字幕",
				data: {
					icon,
					value,
				},
			});
		});
	}

	// 监听旋转变化
	if (ctx.transform) {
		const { rotate, flipX, flipY } = ctx.transform;

		// 监听旋转变化
		watch(rotate, (newRotate: number, oldRotate: number | undefined) => {
			if (oldRotate === undefined) return;
			show({
				title: "旋转",
				data: {
					icon: RotateSvg,
					value: `${newRotate}°`,
				},
			});
		});

		// 监听水平翻转
		watch(flipX, (newFlipX: boolean) => {
			show({
				title: "水平翻转",
				data: {
					icon: FlipSvg,
					value: newFlipX ? "开启" : "关闭",
				},
			});
		});

		// 监听垂直翻转
		watch(flipY, (newFlipY: boolean) => {
			show({
				title: "垂直翻转",
				data: {
					icon: FlipSvg,
					value: newFlipY ? "开启" : "关闭",
				},
			});
		});
	}

	// 显示快进/快退HUD
	const showFastJumpHud = (dir: number) => {
		// 计算当前进度百分比
		const currentProgress = getCurrentProgressPercentage();
		const title = dir === 1 ? "快进" : "快退";

		// 创建消息并添加进度信息
		show({
			title,
			data: {
				icon: dir === 1 ? FastForwardSvg : FastRewindSvg,
				max: 100,
				min: 0,
				// 直接把当前进度作为消息的属性
				progress: currentProgress,
				value: formatTime(ctx.playerCore.value?.currentTime || 0),
			},
			duration: DurationOptions.Fast,
		});
	};

	// 显示长按快进HUD
	const showLongPressFastForward = () => {
		// 计算当前进度百分比
		const currentProgress = getCurrentProgressPercentage();
		show({
			title: "快速播放",
			data: {
				icon: RocketLaunchSvg,
				value: `${formatTime(ctx.playerCore.value?.currentTime || 0)}`,
				max: 100,
				min: 0,
				progress: currentProgress,
			},
		});
	};

	// 组件卸载时清理定时器
	onUnmounted(() => {
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	});

	return {
		messages,
		show,
		clear,
		showProgressJump,
		showFastJumpHud,
		showMute,
		showPlaybackRate,
		showVolume,
		showLongPressFastForward,
	};
};
