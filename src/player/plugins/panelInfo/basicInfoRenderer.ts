import { NORMAL_URL_115 } from "../../../constants/115";
import type { PlayingVideoInfo } from "../../../types/player";
import type { Entity } from "../../../utils/drive115";

/**
 * 基本信息渲染器
 */
export class BasicInfoRenderer {
	static render(info: PlayingVideoInfo, filePath: Entity.PathItem[]): string {
		return `
            <div class="dplayer-panel-title-wrapper">
                <div class="dplayer-panel-title">
                    ${info.title}
                </div>
                <div class="dplayer-panel-basic-info">
                    ${filePath
											.map(
												(item) =>
													`<a href="${BasicInfoRenderer.getFilePathUrl(
														item,
													)}" target="_blank">${item.name}</a>`,
											)
											.join(" / ")}
                </div>
                <div class="dplayer-panel-basic-info">
                    ${BasicInfoRenderer.formatFileSize(
											info.size,
										)} · ${BasicInfoRenderer.formatDate(info.createTime)}
                </div>
            </div>
        `;
	}

	private static getFilePathUrl(item: Entity.PathItem): string {
		return new URL(
			`?${new URLSearchParams({
				cid: item.cid,
				offset: "0",
				mode: "wangpan",
			}).toString()}`,
			NORMAL_URL_115,
		).href;
	}

	private static formatFileSize(bytes: number): string {
		if (!bytes) return "未知";
		const units = ["B", "KB", "MB", "GB", "TB"];
		let size = bytes;
		let unitIndex = 0;

		while (size >= 1024 && unitIndex < units.length - 1) {
			size /= 1024;
			unitIndex++;
		}

		return `${size.toFixed(2)} ${units[unitIndex]}`;
	}

	private static formatDate(timestamp: number | undefined): string {
		if (!timestamp) return "未知";
		const date = new Date(timestamp);
		return date
			.toLocaleDateString("zh-CN", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
			})
			.replace(/\//g, "-");
	}
}
