import {
	type EmitFn,
	type InjectionKey,
	type ShallowRef,
	inject,
	provide,
} from "vue";
import type { XPlayerEmit, XPlayerProps } from "../types";
import { useControls } from "./useControls";
import { useCssVar } from "./useCssVar";
import { useFullscreen } from "./useFullscreen";
import { useHotKey } from "./useHotKey";
import { useHud } from "./useHud";
import { usePictureInPicture } from "./usePictureInPicture";
import { usePlaybackRate } from "./usePlaybackRate";
import { usePlaying } from "./usePlaying";
import { useProgress } from "./useProgress";
import { useProgressBar } from "./useProgressBar";
import { useSource } from "./useSources";
import { useSubtitles } from "./useSubtitles";
import { useThumbnailSettings } from "./useThumbnailSettings";
import { useTransform } from "./useTransform";
import { useVolume } from "./useVolume";

export interface PlayerContext {
	rootProps: XPlayerProps;
	rootEmit: EmitFn<XPlayerEmit>;
	fullscreen?: ReturnType<typeof useFullscreen>;
	pictureInPicture?: ReturnType<typeof usePictureInPicture>;
	volume?: ReturnType<typeof useVolume>;
	playbackRate?: ReturnType<typeof usePlaybackRate>;
	progress?: ReturnType<typeof useProgress>;
	progressBar?: ReturnType<typeof useProgressBar>;
	playing?: ReturnType<typeof usePlaying>;
	controls?: ReturnType<typeof useControls>;
	subtitles?: ReturnType<typeof useSubtitles>;
	source?: ReturnType<typeof useSource>;
	hotKey: ReturnType<typeof useHotKey>;
	transform?: ReturnType<typeof useTransform>;
	thumbnailSettings?: ReturnType<typeof useThumbnailSettings>;
	hud?: ReturnType<typeof useHud>;
	cssVar?: ReturnType<typeof useCssVar>;
	refs: {
		videoElementRef: ShallowRef<HTMLVideoElement | null>;
		rootRef: ShallowRef<HTMLElement | null>;
		videoMaskRef: ShallowRef<HTMLDivElement | null>;
	};
}

export const PlayerSymbol: InjectionKey<PlayerContext> = Symbol("XPlayer");

export function usePlayerProvide(
	rootProps: XPlayerProps,
	rootEmit: EmitFn<XPlayerEmit>,
	refs: {
		rootRef: ShallowRef<HTMLElement | null>;
		videoElementRef: ShallowRef<HTMLVideoElement | null>;
		videoMaskRef: ShallowRef<HTMLDivElement | null>;
	},
) {
	const context: PlayerContext = {
		refs: {
			rootRef: refs.rootRef,
			videoElementRef: refs.videoElementRef,
			videoMaskRef: refs.videoMaskRef,
		},
		rootProps,
		rootEmit,
		fullscreen: undefined,
		volume: undefined,
		playbackRate: undefined,
		progress: undefined,
		progressBar: undefined,
		playing: undefined,
		controls: undefined,
		subtitles: undefined,
		source: undefined,
		hotKey: undefined,
		thumbnailSettings: undefined,
		cssVar: undefined,
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

	// 进度条
	const progressBar = useProgressBar(context);
	context.progressBar = progressBar;

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

	// 画面转换
	const transform = useTransform(context);
	context.transform = transform;

	// 预览图设置
	const thumbnailSettings = useThumbnailSettings(context);
	context.thumbnailSettings = thumbnailSettings;

	// HUD显示
	const hud = useHud(context);
	context.hud = hud;

	// 变量
	const cssVar = useCssVar(context);
	context.cssVar = cssVar;

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
