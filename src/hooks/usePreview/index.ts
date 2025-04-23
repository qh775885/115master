import { useAsyncState } from "@vueuse/core";
import { previewCache } from "../../utils/cache";
import { M3U8ClipperNew } from "../../utils/clipper/m3u8Clipper";
import { drive115 } from "../../utils/drive115";
import { getImageResize } from "../../utils/image";

// 最大宽度
const MAX_WIDTH = 720;
// 最大高度
const MAX_HEIGHT = 720;

/**
 * 预览图
 */
export type Preview = {
	// 图片
	img: string;
	// 宽度
	width: number;
	// 高度
	height: number;
	// 帧实际时间（秒）
	frameTime: number;
	// 跳转时间（秒）
	seekTime: number;
} | null;

/**
 * 获取预览图
 */
export const usePreview = () => {
	/**
	 * 获取预览图
	 * @param option.sha1 文件的 sha1 用于作为缓存 Key
	 * @param option.pickCode 文件的 pickCode 用于获取 m3u8 列表
	 * @param option.coverNum 预览图数量
	 * @param option.duration 视频时长
	 * @returns 预览图
	 */
	const getPreview = async (option: {
		sha1: string;
		pickCode: string;
		coverNum: number;
		duration: number;
	}) => {
		const { sha1, pickCode, coverNum, duration } = option;
		// 偏移量
		const offset = duration / 5;
		// 获取最小时间
		const minTime = offset;
		// 获取最大时间
		const maxTime = duration - offset;
		// 范围
		const range = maxTime - minTime;

		// 计算时间
		const times = Array.from({ length: coverNum }, (_, i) =>
			Math.floor(minTime + (range / coverNum) * i),
		);

		// 获取缓存结果
		const cachePromises = times.map(async (time) => {
			const cacheKey = `${sha1}_${time}`;
			const cache = await previewCache.get(cacheKey);
			return {
				time,
				cache,
				cacheKey,
			};
		});

		// 获取缓存结果
		const cacheResults = await Promise.all(cachePromises);

		// 获取未缓存结果
		const notCacheResults = cacheResults.filter((result) => !result?.cache);

		// 如果所有结果都已缓存，则直接返回
		if (notCacheResults.length === 0) {
			return cacheResults.map((result) => result.cache?.value);
		}

		// 获取 m3u8 列表
		const m3u8List = await drive115.getM3u8(pickCode);
		// 获取源
		const source = m3u8List.sort((a, b) => a.quality - b.quality)[0];
		if (!source) {
			throw new Error("source is null");
		}
		// 创建 clipper
		const clipper = new M3U8ClipperNew({
			url: source.url,
		});
		// 打开 clipper
		await clipper.open();

		// 获取预览图
		const promises = cacheResults.map(async (cacheResult) => {
			// 如果已缓存，则直接返回
			if (cacheResult.cache) {
				return cacheResult.cache.value;
			}

			// 获取截图
			const result = await clipper.seek(cacheResult.time, true);
			if (!result) {
				return null;
			}
			// 缩放
			const resize = getImageResize(
				result.videoFrame.displayWidth,
				result.videoFrame.displayHeight,
				MAX_WIDTH,
				MAX_HEIGHT,
			);
			const canvas = document.createElement("canvas");
			canvas.width = resize.width;
			canvas.height = resize.height;
			const ctx = canvas.getContext("2d");
			if (!ctx) {
				return null;
			}
			// 绘制
			ctx.drawImage(
				await createImageBitmap(result.videoFrame, {
					resizeQuality: "pixelated",
					resizeWidth: resize.width,
					resizeHeight: resize.height,
				}),
				0,
				0,
				resize.width,
				resize.height,
			);
			// 转换为 base64
			const img = canvas.toDataURL("image/webp", 0.85);
			// 关闭
			result.videoFrame.close();
			// 返回
			const preview: Preview = {
				img,
				width: resize.width,
				height: resize.height,
				frameTime: result.frameTime,
				seekTime: cacheResult.time,
			};

			// 缓存
			previewCache.set(cacheResult.cacheKey, preview);
			return preview;
		});

		// 返回用于显示的数据
		return Promise.all(promises);
	};

	const previewData = useAsyncState(getPreview, null, { immediate: false });

	return previewData;
};
