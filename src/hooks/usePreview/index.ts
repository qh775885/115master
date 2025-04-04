import { useAsyncState } from "@vueuse/core";
import { sampleSize } from "lodash";
import { previewCache } from "../../utils/cache";
import { M3U8Clipper } from "../../utils/clipper/m3u8";
import { drive115 } from "../../utils/drive115";
import {
	blobToBase64,
	getImageSize,
	imageBitmapToBlob,
	isBlackFrame,
} from "../../utils/image";

export const usePreview = () => {
	const fetchVideoData = async (sha1: string, pickCode: string) => {
		const cache = await previewCache.get(sha1);
		if (cache) {
			// 从缓存获取数据后，将Blob转换为base64用于显示
			const cachedData = cache.value;
			const processedData = await Promise.all(
				cachedData.map(async (item) => {
					// 将缓存的Blob转换为base64用于显示
					const base64 = await blobToBase64(item);
					const { width, height } = await getImageSize(base64);
					return {
						img: base64,
						width,
						height,
					};
				}),
			);
			return processedData;
		}

		const m3u8List = await drive115.getM3u8(pickCode);
		const source = m3u8List.sort((a, b) => a.quality - b.quality)[0];
		if (!source) return null;

		const clipper = new M3U8Clipper({
			maxWidth: 720,
			maxHeight: 720,
		});
		await clipper.init(source.url, 0);
		const segments = sampleSize(clipper.M3U8Info?.segments ?? [], 5);
		const frames = await Promise.all(
			segments.map((segment) => clipper.getClip(segment._startTime)),
		);

		// 生成缩略图
		const thumbnails = await Promise.all(
			frames
				.filter((f) => !!f)
				.map(async (frame) => {
					const width = frame?.img.width;
					const height = frame?.img.height;

					// 检测是否为黑帧
					const isBlack = await isBlackFrame(frame.img);
					if (isBlack) return null;

					// 直接从ImageBitmap创建Blob用于缓存
					const blob = await imageBitmapToBlob(frame.img, 0.8);

					// 将Blob转换为base64用于显示
					const base64 = await blobToBase64(blob);

					return {
						// 用于显示
						img: base64,
						// 用于缓存
						cacheBlob: blob,
						width,
						height,
					};
				}),
		);

		clipper.clear();

		const filteredThumbnails = thumbnails.filter((f) => !!f);

		try {
			// 缓存数据 - 使用Blob
			const cacheData = filteredThumbnails.map((item) => item.cacheBlob);
			await previewCache.set(sha1, cacheData);
		} catch (error) {
			console.error("缓存失败:", error);
		}

		// 返回用于显示的数据
		return filteredThumbnails.map((item) => ({
			img: item.img,
			width: item.width,
			height: item.height,
		}));
	};

	const videoData = useAsyncState(fetchVideoData, null, { immediate: false });

	return videoData;
};
