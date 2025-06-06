import { unsafeWindow } from "$";
import { getUrlParams } from "../../../utils/url";
import type { TopRootSearchParams } from "../global";
import { openOfflineTask } from "./openOfflineTask";

/**
 * 顶部导航栏修改器
 * @description
 * 1. 添加自定义的云下载一级按钮
 * 2. 删除官方的云下载按钮
 * 3. 云下载按钮免除刷新重定向
 */
export class TopHeaderMod {
	constructor() {
		this.init();
	}

	get topHeaderNode() {
		return document.querySelector(unsafeWindow.Main.CONFIG.TopPanelBox)
			?.firstElementChild as HTMLElement;
	}

	private init() {
		if (!this.topHeaderNode) return;
		const params = getUrlParams<TopRootSearchParams>(
			top?.window.location.search ?? "",
		);
		if (params.mode === "search") {
			return;
		}
		this.deleteOfficialDownloadButton();
		const offlineTaskButton = this.createOfflineTaskButton();
		this.topHeaderNode?.prepend(offlineTaskButton);
		this.deleteOfficialDownloadButton();
	}

	// 删除官方的离线任务按钮
	private deleteOfficialDownloadButton() {
		const downloadButton = this.topHeaderNode?.querySelector(
			".button[menu='offline_task']",
		);
		if (downloadButton) {
			downloadButton.remove();
		}
	}

	// 创建离线任务按钮
	private createOfflineTaskButton() {
		const button = document.createElement("a");
		button.classList.add("button");
		button.href = "javascript:void(0)";
		button.innerHTML = `
            <i class="icon-operate ifo-linktask"></i>
            <span>云下载</span>
        `;
		button.style.background = "#3a4783";
		button.style.borderColor = "#3a4783";
		button.onclick = () => {
			openOfflineTask();
		};
		return button;
	}

	public destroy() {}
}
