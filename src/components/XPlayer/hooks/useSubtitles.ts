import { ref, watch } from "vue";
import type { Subtitle } from "../types";
import type { PlayerContext } from "./usePlayerProvide";

export const useSubtitles = (ctx: PlayerContext) => {
	// 视频元素
	const videoElementRef = ctx.refs.videoElementRef;
	// 当前字幕
	const current = ref<Subtitle | null>(null);

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
		current.value = subtitle;
		changeTrack(subtitle);
		ctx.rootProps.onSubtitleChange?.(subtitle);
	};

	// 设置默认字幕
	const setDefaultSubtitle = (subtitles: Subtitle[]) => {
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
		if (newSubtitles) {
			setDefaultSubtitle(newSubtitles);
		}
	});

	return {
		list: ctx.rootProps.subtitles,
		current,
		change,
		loadingSubtitles: ctx.rootProps.loadingSubtitles,
		restoreCurrentSubtitle,
	};
};
