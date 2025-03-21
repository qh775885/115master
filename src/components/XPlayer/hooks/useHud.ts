import { computed, onUnmounted, ref, watch } from "vue";
import type { HudContext, HudMessage, HudMessageType } from "../types/hud";
import type { PlayerContext } from "./usePlayerProvide";

// 默认消息持续时间（毫秒）
const DEFAULT_DURATION = 1500;

/**
 * HUD消息管理
 */
export const useHud = (ctx: PlayerContext): HudContext => {
	// 当前消息 - 只保留一条最新消息
	const currentMessage = ref<HudMessage | null>(null);
	// 超时ID
	let timeoutId: number | null = null;

	// 消息数组 - 计算属性，始终只包含当前消息（如果有）
	const messages = computed(() => {
		return currentMessage.value ? [currentMessage.value] : [];
	});

	// 显示消息
	const show = (message: Omit<HudMessage, "timestamp">) => {
		const timestamp = Date.now();
		const duration = message.duration || DEFAULT_DURATION;

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

	// 创建一个通用的显示消息方法
	const showMessage = (
		type: HudMessageType,
		title: string,
		value?: string | number | boolean,
		options?: {
			max?: number;
			min?: number;
			duration?: number;
		},
	) => {
		show({
			type,
			title,
			data: {
				value,
				max: options?.max,
				min: options?.min,
			},
			duration: options?.duration,
		});
	};

	// 获取当前播放进度百分比
	const getCurrentProgressPercentage = () => {
		if (!ctx.progress) return 0;

		return ctx.progress.duration.value > 0
			? (ctx.progress.currentTime.value / ctx.progress.duration.value) * 100
			: 0;
	};

	// 监听音量变化
	if (ctx.volume) {
		const { volume, muted } = ctx.volume;
		// 监听音量变化
		watch(volume, (newVolume: number, oldVolume: number | undefined) => {
			if (oldVolume === undefined) return;
			showMessage("volume", "音量", newVolume, {
				max: 100,
				min: 0,
			});
		});

		// 监听静音变化
		watch(muted, (newMuted: boolean) => {
			showMessage("mute", newMuted ? "静音" : "取消静音");
		});
	}

	// 监听播放速度变化
	if (ctx.playbackRate) {
		const { current } = ctx.playbackRate;
		watch(current, (newRate: number, oldRate: number | undefined) => {
			if (oldRate === undefined) return;
			showMessage("speed", "播放速度", newRate);
		});
	}

	// 监听字幕变化
	if (ctx.subtitles) {
		const { current } = ctx.subtitles;
		watch(current, (newSubtitle) => {
			showMessage("subtitle", "字幕", newSubtitle ? newSubtitle.label : "关闭");
		});
	}

	// 监听旋转变化
	if (ctx.transform) {
		const { rotate, flipX, flipY } = ctx.transform;

		// 监听旋转变化
		watch(rotate, (newRotate: number, oldRotate: number | undefined) => {
			if (oldRotate === undefined) return;
			showMessage("transform", "旋转", `${newRotate}°`);
		});

		// 监听水平翻转
		watch(flipX, (newFlipX: boolean) => {
			showMessage("transform", "水平翻转", newFlipX ? "开启" : "关闭");
		});

		// 监听垂直翻转
		watch(flipY, (newFlipY: boolean) => {
			showMessage("transform", "垂直翻转", newFlipY ? "开启" : "关闭");
		});
	}

	// 拦截播放器的skip方法，添加HUD显示
	if (ctx.progress) {
		const originalSkip = ctx.progress.skip;

		// 重写skip方法
		ctx.progress.skip = (value: number, isPercent?: boolean) => {
			// 调用原始方法
			originalSkip(value, isPercent);

			// 显示快进/快退消息
			if (!isPercent) {
				// 计算当前进度百分比
				const currentProgress = getCurrentProgressPercentage();

				// 创建消息并添加进度信息
				show({
					type: value > 0 ? "fastForward" : "fastBackward",
					title: value > 0 ? "快进" : "快退",
					data: {
						value: `${Math.abs(value)}秒`,
						max: 100,
						min: 0,
						// 直接把当前进度作为消息的属性
						progress: currentProgress,
					},
					duration: DEFAULT_DURATION,
				});
			}
		};
	}

	// 如果存在playbackRate的长按快进功能
	if (ctx.playbackRate) {
		const originalStartLongPress = ctx.playbackRate.startLongPressFastForward;
		const originalStopLongPress = ctx.playbackRate.stopLongPressFastForward;

		if (originalStartLongPress && originalStopLongPress) {
			// 重写长按快进方法
			ctx.playbackRate.startLongPressFastForward = () => {
				originalStartLongPress();

				// 计算当前进度百分比
				const currentProgress = getCurrentProgressPercentage();

				// 创建HUD消息，包含当前进度
				show({
					type: "fastForward",
					title: "快速播放",
					data: {
						value: `${ctx.playbackRate?.MAX_RATE || 15}x`,
						max: 100,
						min: 0,
						progress: currentProgress,
					},
					duration: 2000,
				});
			};

			// 重写停止长按快进方法
			ctx.playbackRate.stopLongPressFastForward = () => {
				originalStopLongPress();

				// 长按松开时立即清除HUD消息
				clear();
			};
		}
	}

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
	};
};
