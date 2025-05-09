import { shallowRef } from "vue";

/**
 * 播放器核心状态
 */
export const usePlayerCoreState = () => {
	// 当前时间
	const currentTime = shallowRef(0);
	// 总时长
	const duration = shallowRef(0);
	// 是否暂停
	const paused = shallowRef(true);
	// 播放速率
	const playbackRate = shallowRef(1);
	// 音量
	const volume = shallowRef(100);
	// 是否静音
	const muted = shallowRef(false);
	// 是否加载中
	const isLoading = shallowRef(true);
	// 是否自动播放
	const autoPlay = shallowRef(true);
	// 是否可以播放
	const canplay = shallowRef(false);
	// 加载错误
	const loadError = shallowRef<Error | undefined>(undefined);
	// 是否加载完成
	const loaded = shallowRef(false);
	// 视频宽度
	const videoWidth = shallowRef(0);
	// 视频高度
	const videoHeight = shallowRef(0);

	return {
		currentTime,
		duration,
		paused,
		playbackRate,
		volume,
		muted,
		isLoading,
		loaded,
		autoPlay,
		canplay,
		loadError,
		videoWidth,
		videoHeight,
		reset: () => {
			currentTime.value = 0;
			duration.value = 0;
			paused.value = true;
			playbackRate.value = 1;
			volume.value = 100;
			muted.value = false;
			autoPlay.value = true;
			canplay.value = false;
			isLoading.value = true;
			loaded.value = false;
			loadError.value = undefined;
			videoWidth.value = 0;
			videoHeight.value = 0;
		},
	};
};
