import { type Ref, ref, watch } from "vue";
import type { Subtitle } from "../types";

export const useSubtitles = (
	videoElementRef: Ref<HTMLVideoElement | null>,
	subtitles: Ref<Subtitle[] | null>,
	loadingSubtitles: Ref<boolean>,
	onSubtitleChange?: (subtitle: Subtitle | null) => void,
) => {
	const current = ref<Subtitle | null>(null);

	const changeTrack = (subtitle: Subtitle | null) => {
		const tracks = videoElementRef.value?.textTracks;
		if (tracks) {
			for (let i = 0; i < tracks.length; i++) {
				tracks[i].mode = "disabled";
			}
			if (subtitle) {
				const index =
					subtitles.value?.findIndex((s) => s.url === subtitle.url) ?? -1;
				if (index >= 0 && tracks[index]) {
					tracks[index].mode = "showing";
				}
			}
		}
	};

	const change = (subtitle: Subtitle | null) => {
		current.value = subtitle;
		changeTrack(subtitle);
		onSubtitleChange?.(subtitle);
	};

	const setDefaultSubtitle = (subtitles: Subtitle[]) => {
		const defaultSubtitle = subtitles.find((s) => s.default);
		if (defaultSubtitle) {
			change(defaultSubtitle);
		}
	};

	const restoreCurrentSubtitle = () => {
		if (current.value) {
			change(current.value);
		}
	};

	// 监听字幕列表变化，设置默认字幕
	watch(subtitles, (newSubtitles) => {
		if (newSubtitles) {
			setDefaultSubtitle(newSubtitles);
		}
	});

	return {
		list: subtitles,
		current,
		change,
		loadingSubtitles,
		restoreCurrentSubtitle,
	};
};
