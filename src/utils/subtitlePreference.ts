import localforage from "localforage";
import type { Subtitle } from "../components/XPlayer/types";
import { AppLogger } from "./logger";

// 字幕偏好 id
export type SubtitlePreference = Subtitle;

export class SubtitlePreferenceManager {
	private store: typeof localforage;
	private logger = new AppLogger("Utils SubtitlePreference");
	private readonly STORE_PREFIX = "115master_subtitle_preference_";

	constructor() {
		this.store = localforage.createInstance({
			name: "115master",
			storeName: "subtitle_preferences",
		});
	}

	private getStoreKey(videoName: string): string {
		// 移除文件扩展名和清理文件名
		const cleanName = videoName.replace(/\.[^/.]+$/, "").trim();
		return `${this.STORE_PREFIX}${cleanName}`;
	}

	async savePreference(
		pickcode: string,
		subtitle: Subtitle | null,
	): Promise<void> {
		try {
			const key = this.getStoreKey(pickcode);
			if (subtitle) {
				await this.store.setItem(key, subtitle);
				this.logger.log("保存字幕偏好成功", { pickcode, subtitle });
			} else {
				await this.store.removeItem(key);
				this.logger.log("清除字幕偏好成功", { pickcode });
			}
		} catch (error) {
			this.logger.error("保存字幕偏好失败", error);
		}
	}

	async getPreference(pickcode: string): Promise<SubtitlePreference | null> {
		try {
			const key = this.getStoreKey(pickcode);
			const preference = await this.store.getItem<SubtitlePreference>(key);
			this.logger.log("获取字幕偏好", {
				pickcode: pickcode,
				found: !!preference,
			});
			return preference;
		} catch (error) {
			this.logger.error("获取字幕偏好失败", error);
			return null;
		}
	}

	async clear(): Promise<void> {
		try {
			await this.store.clear();
			this.logger.log("清除所有字幕偏好成功");
		} catch (error) {
			this.logger.error("清除字幕偏好失败", error);
		}
	}
}

export const subtitlePreference = new SubtitlePreferenceManager();
