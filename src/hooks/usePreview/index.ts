import { useElementVisibility, useScroll } from "@vueuse/core";
import { type Ref, onUnmounted, reactive, watch } from "vue";
import { FRIENDLY_ERROR_MESSAGE } from "../../constants";
import { previewCache } from "../../utils/cache";
import { M3U8ClipperNew } from "../../utils/clipper/m3u8Clipper";
import { drive115 } from "../../utils/drive115";
import { Drive115Error } from "../../utils/drive115/core";
import { getImageResize } from "../../utils/image";
import { Scheduler, SchedulerError, TaskStatus } from "../../utils/scheduler";

/** 最大宽度 */
const MAX_WIDTH = 720;

/** 最大高度 */
const MAX_HEIGHT = 720;

/** 预览图调度器 */
const previewScheduler = new Scheduler<Preview[]>({
	maxConcurrent: 3,
});

/** 预览图基础数据 */
type PreviewBase = {
	// 宽度
	width: number;
	// 高度
	height: number;
	// 帧实际时间（秒）
	frameTime: number;
	// 跳转时间（秒）
	seekTime: number;
};

/**
 * 预览图原始数据
 */
export type PreviewRaw = PreviewBase & {
	// 图片 blob
	blob: Blob;
};

/**
 * 预览图数据
 */
export type Preview = PreviewBase & {
	// 图片 blob URL
	img: string;
};

/**
 * 预览选项
 */
export type PreviewOptions = {
	/** sha1 */
	sha1: string;
	/** 文件提取码 */
	pickCode: string;
	/** 数量 */
	coverNum: number;
	/** 持续时间 */
	duration: number;
};

/**
 * 智能加载配置
 */
export type SmartLoadConfig = {
	/** 元素可见性检测的根元素 */
	elementRef: Ref<HTMLElement | undefined>;
	/** 额外的可见性条件（如父容器可见性） */
	additionalVisible?: Ref<boolean>;
	/** 滚动容器（用于优化可见性检测和滚动防抖） */
	scrollTarget?: Ref<HTMLElement | undefined> | HTMLElement;
	/** 可见性检测的阈值 */
	threshold?: number;
	/** 根边距 */
	rootMargin?: string;
};

/**
 * 生成预览任务ID
 */
const generatePreviewTaskId = (options: PreviewOptions): string => {
	return `preview_${options.sha1}_${options.pickCode}_${options.coverNum}_${options.duration}`;
};

/**
 * 获取缓存键
 */
const getCacheKey = (sha1: string, time: number): string => `${sha1}_${time}`;

/**
 * 计算预览时间点
 * @param duration 视频时长
 * @param coverNum 封面数量
 * @returns 预览时间点数组
 */
const calculatePreviewTimes = (
	duration: number,
	coverNum: number,
): number[] => {
	// 偏移量
	const offset = duration / 5;
	// 获取最小时间
	const minTime = offset;
	// 获取最大时间
	const maxTime = duration - offset;
	// 范围
	const range = maxTime - minTime;

	// 计算时间
	return Array.from({ length: coverNum }, (_, i) =>
		Math.floor(minTime + (range / coverNum) * i),
	);
};

/**
 * 将数据转换为可预览数据
 */
const convertPreviewableData = (rawData: PreviewRaw): Preview => ({
	img: URL.createObjectURL(rawData.blob),
	...rawData,
});

/**
 * 生成单个预览图原始数据
 */
const generatePreviewRaw = async (
	clipper: M3U8ClipperNew,
	time: number,
): Promise<PreviewRaw> => {
	// 获取截图
	const result = await clipper.seek(time, true);
	if (!result) {
		throw new Error("no clipper result");
	}

	// 缩放
	const resize = getImageResize(
		result.videoFrame.displayWidth,
		result.videoFrame.displayHeight,
		MAX_WIDTH,
		MAX_HEIGHT,
	);

	// 使用 OffscreenCanvas
	const canvas = new OffscreenCanvas(resize.width, resize.height);
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		throw new Error("no canvas context");
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

	// 转换成 blob
	const blob = await canvas.convertToBlob({
		type: "image/webp",
		quality: 0.85,
	});

	// 关闭
	result.videoFrame.close();

	// 缓存 blob 数据
	const previewRaw: PreviewRaw = {
		blob,
		width: resize.width,
		height: resize.height,
		frameTime: result.frameTime,
		seekTime: time,
	};
	return previewRaw;
};

/**
 * 从缓存获取预览图
 */
const getPreviewsFromCache = async (
	sha1: string,
	times: number[],
): Promise<Preview[]> => {
	const previews: Preview[] = [];
	for (const time of times) {
		const cacheKey = getCacheKey(sha1, time);
		const cache = await previewCache.get(cacheKey);
		if (!cache) {
			return [];
		}
		const cacheData = cache.value;
		previews.push(convertPreviewableData(cacheData));
	}
	return previews;
};

/**
 * 获取预览图
 */
const getPreview = async (
	sha1: string,
	pickCode: string,
	times: number[],
): Promise<Preview[]> => {
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
	const promises = times.map(async (time) => {
		const cacheKey = getCacheKey(sha1, time);
		const previewRaw = await generatePreviewRaw(clipper, time);
		previewCache.set(cacheKey, previewRaw);
		return convertPreviewableData(previewRaw);
	});

	// 返回用于显示的数据
	return Promise.all(promises);
};

/**
 * 清理 blob URL
 */
const cleanupBlobUrl = (previews: string[]): void => {
	previews.forEach((preview) => {
		if (preview.startsWith("blob:")) {
			URL.revokeObjectURL(preview);
		}
	});
};

/**
 * 智能预览图 Hook - 带可见性检测和滚动防抖的智能加载策略
 */
export const useSmartPreview = (
	options: Ref<PreviewOptions>,
	config: SmartLoadConfig,
) => {
	/** 预览数据 */
	const preview = reactive<{
		isReady: boolean;
		isLoading: boolean;
		error: unknown;
		state: Preview[];
	}>({
		isReady: false,
		isLoading: false,
		error: undefined,
		state: [],
	});

	/** 预览任务ID */
	const previewTaskId = generatePreviewTaskId(options.value);

	/** 预览时间点 */
	const times = calculatePreviewTimes(
		options.value.duration,
		options.value.coverNum,
	);

	/** 可见性 */
	const visibility = useElementVisibility(config.elementRef, {
		threshold: config.threshold ?? 0,
		rootMargin: config.rootMargin ?? "0%",
		scrollTarget: config.scrollTarget,
	});

	/**
	 * 获取预览图数据
	 */
	const getData = async (id: string, options: PreviewOptions) => {
		if (preview.isReady || preview.error) {
			return;
		}

		const task = previewScheduler.get(id);
		if (task) {
			return;
		}
		preview.isLoading = true;
		try {
			const data = await addTask(id, options.sha1, options.pickCode, times);
			preview.state = data;
			preview.isReady = true;
		} catch (error) {
			if (error instanceof SchedulerError.TaskCancelled) {
				return;
			}
			if (error instanceof Drive115Error.NotFoundM3u8File) {
				preview.error =
					FRIENDLY_ERROR_MESSAGE.CANNOT_PREVIEW_WITHOUT_TRANSCODING;
				return;
			}
			preview.error = error;
		} finally {
			preview.isLoading = false;
		}
	};

	/** 从缓存获取预览图数据 */
	const getDataByCache = async (options: PreviewOptions) => {
		if (preview.isReady || preview.error) {
			return;
		}

		preview.isLoading = true;
		try {
			const data = await getPreviewsFromCache(options.sha1, times);
			if (data.length > 0) {
				preview.state = data;
				preview.isLoading = false;
				preview.isReady = true;
			}
		} catch (error) {
			preview.error = error;
		} finally {
			preview.isLoading = false;
		}
	};

	/** 添加任务 */
	const addTask = (
		id: string,
		sha1: string,
		pickCode: string,
		times: number[],
	) => {
		return previewScheduler.add(
			() => {
				return getPreview(sha1, pickCode, times);
			},
			{
				id,
				immediate: true,
			},
		);
	};

	/** 取消任务 */
	const cancelTask = () => {
		const task = previewScheduler.get(previewTaskId);
		if (task && task.status === TaskStatus.Pending) {
			previewScheduler.cancel(previewTaskId);
		}
	};

	/** 监听可见性 */
	watch(visibility, async (value) => {
		if (value) {
			if (isScrolling.value) {
				getDataByCache(options.value);
			} else {
				await getDataByCache(options.value);
				getData(previewTaskId, options.value);
			}
		} else {
			cancelTask();
		}
	});

	const { isScrolling } = useScroll(config.scrollTarget, {
		throttle: 1000 / 60,
		idle: 100,
		onStop: async () => {
			if (visibility.value) {
				await getDataByCache(options.value);
				getData(previewTaskId, options.value);
			}
		},
	});

	/** 卸载 */
	onUnmounted(() => {
		previewScheduler.remove(previewTaskId);
		cleanupBlobUrl(
			preview.state
				.map((item) => item?.img)
				.filter((item) => item !== undefined),
		);
	});

	return {
		preview,
	};
};
