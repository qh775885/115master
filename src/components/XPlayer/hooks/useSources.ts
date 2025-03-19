import { computed, nextTick, ref, shallowRef, watch } from "vue";
import type { VideoSource } from "../types";
import { useHls } from "./useHls";
import type { PlayerContext } from "./usePlayerProvide";

export const useSource = (ctx: PlayerContext) => {
	// 视频元素
	const videoElementRef = ctx.refs.videoElementRef;
	// 视频源列表
	const list = ctx.rootProps.sources;
	// 当前视频源
	const current = ref<VideoSource | null>(null);
	// 视频源唯一标识
	const videoKey = computed(() => current.value?.url);
	// hls
	const hls = useHls(videoElementRef);
	// 清理函数
	const cleanupRef = shallowRef<(() => void) | undefined>(() => void 0);
	// 是否中断
	const isInterrupt = shallowRef(false);

	// 初始化视频
	const initializeVideo = async (source: VideoSource) => {
		let promise: Promise<void> | undefined;
		// 更新当前源
		current.value = source;

		// 等待新的 videoElementRef 更新
		await nextTick();

		if (!videoElementRef.value) {
			throw new Error("videoElementRef is not found");
		}

		// 清理之前的视频源
		if (videoElementRef.value.src) {
			videoElementRef.value.src = "";
		}

		// 如果视频源是 hls
		if (source.type === "hls") {
			hls.initHls(source.url, source.hlsConfig);
		} else {
			// 设置视频源
			videoElementRef.value.src = source.url;
			videoElementRef.value.load();
			promise = videoElementRef.value.play().catch(async (error) => {
				if (error instanceof DOMException && error.name === "AbortError") {
					return;
				}
				if (
					error instanceof DOMException &&
					error.name === "NotSupportedError"
				) {
					console.warn(
						"Unsupported video sources, try switching to the next video source",
					);
					const { promise: nextPromise, clear: nextClear } =
						await initializeVideo(list.value[1]);
					cleanupRef.value = nextClear;
					promise = nextPromise;
					return;
				}
				throw error;
			});
		}

		const clear = () => {
			if (videoElementRef.value) {
				videoElementRef.value.src = "";
				hls.destroy();
			}
		};

		return { promise, clear };
	};

	// 切换视频源
	const changeQuality = async (source: VideoSource) => {
		// 记住当前播放时间和播放状态
		const currentTime = videoElementRef.value?.currentTime || 0;
		const wasPlaying = !videoElementRef.value?.paused;

		cleanupRef.value?.();
		// 切换视频源
		const { clear } = await initializeVideo(source);
		cleanupRef.value = clear;

		// 恢复播放时间和状态
		if (videoElementRef.value) {
			videoElementRef.value.currentTime = currentTime;
			if (wasPlaying) {
				videoElementRef.value.play();
			}
		}
	};

	// 中断源
	const interruptSource = () => {
		isInterrupt.value = true;
		cleanupRef.value?.();
	};

	// 恢复源
	const resumeSource = () => {
		isInterrupt.value = false;
		initializeVideo(current.value!);
	};

	watch(
		list,
		async () => {
			cleanupRef.value?.();
			isInterrupt.value = false;
			if (list.value.length === 0) {
				return;
			}
			const { clear } = await initializeVideo(list.value[0]);
			cleanupRef.value = clear;
		},
		{ immediate: true, deep: true },
	);

	return {
		videoKey,
		list,
		current,
		changeQuality,
		interruptSource,
		resumeSource,
		isInterrupt,
	};
};
