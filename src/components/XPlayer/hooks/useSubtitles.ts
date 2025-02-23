import { type Ref, ref } from "vue";
import type { Subtitle } from "../types";

export const useSubtitles = (
	videoElementRef: Ref<HTMLVideoElement | null>,
	subtitles: Ref<Subtitle[] | null>,
	loadingSubtitles: Ref<boolean>,
) => {
	const current = ref<Subtitle | null>(null);

	const change = (subtitle: Subtitle | null) => {
		current.value = subtitle;
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

	const restoreCurrentSubtitle = () => {
		if (current.value) {
			change(current.value);
		}
	};

	return {
		list: subtitles,
		current,
		change,
		loadingSubtitles,
		restoreCurrentSubtitle,
	};
};
