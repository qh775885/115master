import { type Ref, ref, watch } from "vue";
import type { Subtitle } from "../types";

export const useSubtitles = (
	videoElementRef: Ref<HTMLVideoElement | null>,
	subtitles: Subtitle[],
) => {
	const current = ref<Subtitle | null>(null);
	const list = ref<Subtitle[]>(subtitles);

	const change = (subtitle: Subtitle | null) => {
		current.value = subtitle;
		const tracks = videoElementRef.value?.textTracks;
		if (tracks) {
			for (let i = 0; i < tracks.length; i++) {
				tracks[i].mode = "disabled";
			}
			if (subtitle) {
				const index =
					list.value?.findIndex((s) => s.url === subtitle.url) ?? -1;
				if (index >= 0 && tracks[index]) {
					tracks[index].mode = "showing";
				}
			}
		}
	};

	// 监听 list 变化
	watch(
		() => list.value,
		(subtitles) => {
			current.value = subtitles?.find((s) => s.default) || null;
		},
	);

	return {
		list,
		current,
		change,
	};
};
