import localforage from "localforage";
import { AppLogger } from "../logger";
import type { ProcessedSubtitle } from "./subtitlecat";

interface SubtitleCacheItem {
	subtitles: ProcessedSubtitle[];
	timestamp: number;
	expiresIn: number;
}

export class SubtitleCache {
	private store: typeof localforage;
	private logger = new AppLogger("Utils SubtitleCache");
	private readonly CACHE_PREFIX = "115master_subtitle_";
	private readonly DEFAULT_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000; // 7天过期

	constructor() {
		this.store = localforage.createInstance({
			name: "115master",
			storeName: "subtitles",
		});
	}

	// 生成缓存键
	private getCacheKey(keyword: string, language: string): string {
		return `${this.CACHE_PREFIX}${keyword}_${language}`;
	}

	// 获取缓存
	async get(
		keyword: string,
		language: string,
	): Promise<ProcessedSubtitle[] | null> {
		try {
			const cacheKey = this.getCacheKey(keyword, language);
			const cacheItem = await this.store.getItem<SubtitleCacheItem>(cacheKey);

			if (!cacheItem) {
				this.logger.log("缓存未命中", { keyword, language });
				return null;
			}

			// 检查是否过期
			if (Date.now() - cacheItem.timestamp > cacheItem.expiresIn) {
				this.logger.log("缓存已过期", { keyword, language });
				await this.store.removeItem(cacheKey);
				return null;
			}

			this.logger.log("缓存命中", {
				keyword,
				language,
				count: cacheItem.subtitles.length,
				cacheItem: cacheItem,
			});
			return cacheItem.subtitles;
		} catch (error) {
			this.logger.error("获取缓存失败", error);
			return null;
		}
	}

	async set(
		keyword: string,
		language: string,
		subtitles: ProcessedSubtitle[],
		expiresIn: number = this.DEFAULT_EXPIRES_IN,
	): Promise<void> {
		try {
			const cacheKey = this.getCacheKey(keyword, language);
			const cacheItem: SubtitleCacheItem = {
				subtitles,
				timestamp: Date.now(),
				expiresIn,
			};

			await this.store.setItem(cacheKey, cacheItem);
			this.logger.log("设置缓存成功", {
				keyword,
				language,
				count: subtitles.length,
			});
		} catch (error) {
			this.logger.error("设置缓存失败", error);
		}
	}

	// 清除所有缓存
	async clear(): Promise<void> {
		try {
			await this.store.clear();
			this.logger.log("清除所有缓存成功");
		} catch (error) {
			this.logger.error("清除缓存失败", error);
		}
	}
}

export const subtitleCache = new SubtitleCache();
