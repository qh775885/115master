import { type App, createApp } from "vue";
import ExtPreview from "../components/ExtPreview/index.vue";
import { FileListType, type ItemInfo } from "../types";

// 文件列表预览信息
export class FileItemPreview {
	private vueApp: App | null = null;
	constructor(
		private readonly itemNode: HTMLElement,
		private readonly itemInfo: ItemInfo,
	) {}

	// 加载
	public load() {
		// 如果文件列表类型为网格，则不加载预览视频
		if (this.itemInfo.fileListType === FileListType.grid) {
			return;
		}

		// 如果有番号，则不加载预览视频
		if (this.itemInfo.avNumber) {
			return;
		}

		// 如果视频不可播放，则不加载预览视频
		if (!this.itemInfo.filePlayable) {
			return;
		}

		this.itemNode.classList.add("with-ext-preview");
		const previewDom = document.createElement("div");
		previewDom.className = "ext-preview-root";
		this.itemNode.append(previewDom);
		const app = createApp(ExtPreview, {
			pickCode: this.itemInfo.attributes.pick_code,
			sha1: this.itemInfo.attributes.sha1,
			duration: this.itemInfo.duration,
		});
		app.mount(previewDom);
		this.vueApp = app;
	}

	// 销毁
	public destroy() {
		this.vueApp?.unmount();
	}
}
