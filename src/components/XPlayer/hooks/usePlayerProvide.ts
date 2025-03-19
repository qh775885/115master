import { type EmitFn, type InjectionKey, type Ref, inject, provide } from "vue";
import type { XPlayerEmit, XPlayerProps } from "../types";
import { useControls } from "./useControls";
import { useFullscreen } from "./useFullscreen";
import { useHotKey } from "./useHotKey";
import { usePlaybackRate } from "./usePlaybackRate";
import { usePlaying } from "./usePlaying";
import { useProgress } from "./useProgress";
import { useSource } from "./useSources";
import { useSubtitles } from "./useSubtitles";
import { useVolume } from "./useVolume";
import { usePictureInPicture } from "./usePictureInPicture";

export interface PlayerContext {
	rootProps: XPlayerProps;
	rootEmit: EmitFn<XPlayerEmit>;
	fullscreen?: ReturnType<typeof useFullscreen>;
	pictureInPicture?: ReturnType<typeof usePictureInPicture>;
	volume?: ReturnType<typeof useVolume>;
	playbackRate?: ReturnType<typeof usePlaybackRate>;
	progress?: ReturnType<typeof useProgress>;
	playing?: ReturnType<typeof usePlaying>;
	controls?: ReturnType<typeof useControls>;
	subtitles?: ReturnType<typeof useSubtitles>;
	source?: ReturnType<typeof useSource>;
	hotKey: ReturnType<typeof useHotKey>;
	refs: {
		videoElementRef: Ref<HTMLVideoElement | null>;
	};
}

export const PlayerSymbol: InjectionKey<PlayerContext> = Symbol("XPlayer");

export function usePlayerProvide(
	videoElementRef: Ref<HTMLVideoElement | null>,
	rootProps: XPlayerProps,
	rootEmit: EmitFn<XPlayerEmit>,
) {
	const context: PlayerContext = {
		refs: {
			videoElementRef,
		},
		rootProps,
		rootEmit,
		fullscreen: undefined,
		volume: undefined,
		playbackRate: undefined,
		progress: undefined,
		playing: undefined,
		controls: undefined,
		subtitles: undefined,
		source: undefined,
		hotKey: undefined,
	};

	// 音量
	const volume = useVolume(context);
	context.volume = volume;

	// 播放速度
	const playbackRate = usePlaybackRate(context);
	context.playbackRate = playbackRate;

	// 全屏
	const fullscreen = useFullscreen(context);
	context.fullscreen = fullscreen;

	// 进度
	const progress = useProgress(context);
	context.progress = progress;

	// 播放
	const playing = usePlaying(context);
	context.playing = playing;

	// 控制栏
	const controls = useControls(context);
	context.controls = controls;

	// 字幕
	const subtitles = useSubtitles(context);
	context.subtitles = subtitles;

	// 源
	const source = useSource(context);
	context.source = source;

	// 热键
	const hotKey = useHotKey(context);
	context.hotKey = hotKey;

	// 画中画
	const pictureInPicture = usePictureInPicture(context);
	context.pictureInPicture = pictureInPicture;

	provide(PlayerSymbol, context);
	return context;
}

// 使用播放器上下文的 hook
export function usePlayerContext() {
	const context = inject(PlayerSymbol);
	if (!context) {
		throw new Error(
			"usePlayerContext must be used within a VideoPlayer component",
		);
	}
	return context;
}
