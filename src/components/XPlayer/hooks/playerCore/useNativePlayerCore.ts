import { useEventListener } from "@vueuse/core";
import { shallowRef, watch } from "vue";
import type { PlayerContext } from "../usePlayerProvide";
import { type PlayerCoreMethods, PlayerCoreType } from "./types";
import { usePlayerCoreState } from "./usePlayerCoreState";

/**
 * 原生播放器核心
 */
export const useNativePlayerCore = (_ctx: PlayerContext) => {
	// 视频元素
	const renderElementRef = shallowRef<HTMLVideoElement>();
	// 状态
	const state = usePlayerCoreState();

	// 获取视频元素
	const getVideoElementRef = () => {
		if (!renderElementRef.value) {
			throw new Error("videoElementRef is not found");
		}
		return renderElementRef.value;
	};

	const methods: PlayerCoreMethods = {
		init: async (container) => {
			const videoElement = document.createElement("video");
			container.appendChild(videoElement);
			videoElement.style.width = "100%";
			videoElement.style.height = "100%";
			videoElement.style.objectFit = "contain";
			renderElementRef.value = videoElement;

			useEventListener(renderElementRef, "play", () => {
				state.paused.value = false;
			});
			useEventListener(renderElementRef, "pause", () => {
				state.paused.value = true;
			});
			useEventListener(renderElementRef, "playing", () => {
				state.paused.value = false;
			});
			useEventListener(renderElementRef, "ended", () => {
				state.paused.value = true;
			});
			useEventListener(renderElementRef, "waiting", () => {
				state.isLoading.value = true;
			});
			useEventListener(renderElementRef, "canplay", () => {
				state.isLoading.value = false;
				state.canplay.value = true;
			});
			useEventListener(renderElementRef, "seeking", () => {
				state.isLoading.value = true;
			});
			useEventListener(renderElementRef, "seeked", () => {
				state.isLoading.value = false;
			});
			useEventListener(renderElementRef, "timeupdate", () => {
				state.currentTime.value = renderElementRef.value?.currentTime ?? 0;
			});

			return Promise.resolve();
		},
		load: async (url, lastTime) => {
			const videoElement = getVideoElementRef();

			// 初始化音量
			methods.setVolume(state.volume.value);
			// 初始化静音
			methods.setMute(state.muted.value);
			// 初始化自动播放
			methods.setAutoPlay(state.autoPlay.value);
			// 初始化播放时间
			videoElement.currentTime = lastTime ?? state.currentTime.value;
			// 初始化视频源
			videoElement.src = url;
			// 初始化倍速（必须在src赋值后设置）
			methods.setPlaybackRate(state.playbackRate.value);

			return new Promise((resolve, reject) => {
				useEventListener(renderElementRef, "loadedmetadata", () => {
					state.duration.value = videoElement.duration;
					resolve();

					if (state.autoPlay.value) {
						methods.play();
					}
				});
				useEventListener(renderElementRef, "error", (_event: Event) => {
					if (_event.target instanceof HTMLVideoElement) {
						const error = new Error(_event.target.error?.message);
						error.name = "Media Error";
						state.loadError.value = error;
					} else {
						state.loadError.value = new Error("Video element unknown error");
					}
					reject(state.loadError.value);
				});
			});
		},
		getRenderElement: () => {
			return getVideoElementRef();
		},
		play: () => {
			const videoElement = getVideoElementRef();
			return videoElement
				.play()
				.then(() => {
					state.paused.value = false;
				})
				.catch((error: DOMException) => {
					if (error.name === "NotAllowedError") {
						console.warn(error);
						throw error;
					}
					if (error.name === "AbortError") {
						console.warn(error);
						throw error;
					}
					console.error("native player play error", error);
					state.loadError.value = error;
					throw error;
				});
		},
		pause: () => {
			const videoElement = getVideoElementRef();
			state.paused.value = true;
			videoElement.pause();
			return Promise.resolve();
		},
		togglePlay: () => {
			if (state.paused.value) {
				return methods.play();
			}
			return methods.pause();
		},
		setPlaybackRate: (rate) => {
			const videoElement = getVideoElementRef();
			state.playbackRate.value = rate;
			videoElement.playbackRate = rate;
		},
		setVolume: (volume) => {
			const videoElement = getVideoElementRef();
			state.volume.value = volume;
			videoElement.volume = volume / 100;
		},
		setMute: (muted) => {
			const videoElement = getVideoElementRef();
			state.muted.value = muted;
			videoElement.muted = muted;
		},
		toggleMute: () => {
			methods.setMute(!state.muted.value);
		},
		setAutoPlay: (autoPlay) => {
			const videoElement = getVideoElementRef();
			state.autoPlay.value = autoPlay;
			videoElement.autoplay = autoPlay;
		},
		seek: async (time) => {
			return new Promise<void>((resolve) => {
				const videoElement = getVideoElementRef();
				videoElement.currentTime = time;
				state.currentTime.value = time;
				if (videoElement.src) {
					useEventListener(videoElement, "seeked", () => {
						resolve();
					});
				} else {
					resolve();
				}
			});
		},
		on: (event, callback) => {
			watch(
				renderElementRef,
				(videoElement) => {
					if (videoElement) {
						switch (event) {
							case "canplay":
								videoElement.addEventListener(
									"canplay",
									callback as EventListener,
								);
								break;
							case "timeupdate":
								videoElement.addEventListener("timeupdate", () => {
									callback(videoElement.currentTime);
								});
								break;
							case "seeking":
								videoElement.addEventListener("seeking", () => {
									callback(videoElement.currentTime);
								});
								break;
							case "seeked":
								videoElement.addEventListener("seeked", () => {
									callback(videoElement.currentTime);
								});
								break;
							default:
								videoElement.addEventListener(event, callback as EventListener);
						}
					}
				},
				{
					once: true,
				},
			);
		},
		destroy: () => {
			const videoElement = renderElementRef.value;
			if (!videoElement) return Promise.resolve();

			renderElementRef.value = undefined;
			videoElement.src = "";
			videoElement.remove();
			state.reset();
			return Promise.resolve();
		},
	};

	return {
		...state,
		...methods,
		type: PlayerCoreType.Native as const,
	};
};
