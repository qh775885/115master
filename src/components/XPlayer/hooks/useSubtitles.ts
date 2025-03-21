import { computed, ref, watch } from "vue";
import type { Subtitle } from "../types";
import type { PlayerContext } from "./usePlayerProvide";

export const useSubtitles = (ctx: PlayerContext) => {
	const ready = ref(false);
	// 视频元素
	const videoElementRef = ctx.refs.videoElementRef;
	// 当前字幕
	const current = ref<Subtitle | null>(null);
	// 上一个字幕
	const previousSubtitle = ref<Subtitle | null>(null);
	// 默认字幕
	const defaultSubtitle = computed(() => {
		return (
			ctx.rootProps.subtitles.value?.find((s) => s.default) ??
			ctx.rootProps.subtitles.value?.[0] ??
			null
		);
	});

	// 切换字幕
	const changeTrack = (subtitle: Subtitle | null) => {
		const tracks = videoElementRef.value?.textTracks;
		if (tracks) {
			for (let i = 0; i < tracks.length; i++) {
				tracks[i].mode = "disabled";
			}
			if (subtitle) {
				const index =
					ctx.rootProps.subtitles.value?.findIndex(
						(s) => s.url === subtitle.url,
					) ?? -1;
				if (index >= 0 && tracks[index]) {
					tracks[index].mode = "showing";
				}
			}
		}
	};

	// 切换字幕
	const change = (subtitle: Subtitle | null) => {
		if (subtitle) {
			previousSubtitle.value = subtitle;
		}
		current.value = subtitle;
		changeTrack(subtitle);
		ctx.rootProps.onSubtitleChange?.(subtitle);
	};

	// 开关字幕
	const switchEnabled = (_enabled: boolean) => {};

	// 切换字幕开关
	const toggleEnabled = () => {
		if (current.value) {
			change(null);
		} else if (previousSubtitle.value) {
			change(previousSubtitle.value);
		} else {
			change(defaultSubtitle.value ?? null);
		}
	};

	// 设置默认字幕
	const restoreLastSubtitle = (subtitles: Subtitle[]) => {
		const defaultSubtitle = subtitles.find((s) => s.default);
		if (defaultSubtitle) {
			change(defaultSubtitle);
		}
	};

	// 恢复当前字幕
	const restoreCurrentSubtitle = () => {
		if (current.value) {
			change(current.value);
		}
	};

	// 监听字幕列表变化，设置默认字幕
	watch(ctx.rootProps.subtitles, (newSubtitles) => {
		ready.value = true;
		if (newSubtitles) {
			restoreLastSubtitle(newSubtitles);
		}
	});

	watch(
		() => ctx.source?.current,
		(newSource) => {
			if (newSource) {
				restoreCurrentSubtitle();
			}
		},
	);

	return {
		list: ctx.rootProps.subtitles,
		loading: ctx.rootProps.subtitlesLoading,
		ready: ctx.rootProps.subtitlesReady,
		current,
		change,
		switchEnabled,
		toggleEnabled,
		restoreCurrentSubtitle,
	};
};
