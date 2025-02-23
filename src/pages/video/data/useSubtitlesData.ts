import { useAsyncState } from "@vueuse/core";
import { subtitlecat } from "../../../utils/subtitlecat";

// 字幕
export const useDataSubtitles = () => {
	const subtitles = useAsyncState(
		async (keyword: string) => {
			if (!keyword) {
				return [];
			}
			const ResSubtitles = await subtitlecat.fetchSubtitle(keyword, "zh-CN");
			return ResSubtitles.map((subtitle) => ({
				url: subtitle.url,
				label: subtitle.title,
				srclang: subtitle.targetLanguage,
				kind: "subtitles" as const,
				default: false,
			}));
		},
		[],
		{
			immediate: false,
		},
	);

	return subtitles;
};
