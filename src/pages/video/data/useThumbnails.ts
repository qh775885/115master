import { tryOnUnmounted } from "@vueuse/core";
import type { VideoSource } from "../../../components/XPlayer/types";
import { M3U8Clipper } from "../../../utils/clip";

export function useDataThumbnails() {
	const clipper = new M3U8Clipper({
		queueSize: 100,
		queueConcurrency: 3,
	});

	tryOnUnmounted(() => {
		clipper.clear();
	});

	// 找到最低画质的 HLS 源
	const findLowestQualityHLS = (sources: VideoSource[]): VideoSource | null => {
		let lowestQuality: VideoSource | null = null;
		sources.forEach((source) => {
			if (source.type === "hls") {
				if (!lowestQuality || source.quality < lowestQuality.quality) {
					lowestQuality = source;
				}
			}
		});
		return lowestQuality;
	};

	// 初始化缩略图生成器
	let isInited = false;
	const initialize = async (sources: VideoSource[]) => {
		isInited = false;
		clipper.clear();

		const source = findLowestQualityHLS(sources);
		if (!source) return;
		await clipper.getM3U8InfoByUrl(source.url);
		isInited = true;
	};

	// 获取指定时间点的缩略图
	const getThumbnailAtTime = async (
		type: "Cache" | "Must",
		time: number,
	): Promise<ImageBitmap | null> => {
		if (!isInited || Number.isNaN(time)) {
			return null;
		}
		const clipImage = await clipper.getClipByTime(type, time, {
			maxWidth: 320,
			maxHeight: 180,
			samplesPerSegment: 10,
		});
		return clipImage;
	};

	return {
		initialize,
		getThumbnailAtTime,
	};
}
