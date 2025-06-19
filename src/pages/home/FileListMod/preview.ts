import { type App, createApp } from "vue";
import { PLUS_VERSION } from "../../../constants";
import mainStyles from "../../../styles/main.css?inline";
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

		// 如果有番号并且是Plus版本，则不加载预览视频
		if (this.itemInfo.avNumber && PLUS_VERSION) {
			return;
		}

		// 如果视频不可播放，则不加载预览视频
		if (!this.itemInfo.filePlayable) {
			return;
		}

		this.itemNode.classList.add("with-ext-preview");

		// 创建容器元素
		const extPreviewContainer = document.createElement("div");
		extPreviewContainer.style.width = "100%";
		this.itemNode.append(extPreviewContainer);

		// 创建 shadow DOM
		const shadowRoot = extPreviewContainer.attachShadow({ mode: "open" });

		// 在 shadow DOM 中添加样式
		const styleElement = document.createElement("style");
		styleElement.textContent = mainStyles;
		shadowRoot.appendChild(styleElement);

		// 在 shadow DOM 中创建挂载点
		const previewDom = document.createElement("div");
		previewDom.className = "ext-preview-root";
		previewDom.setAttribute("data-theme", "light");
		shadowRoot.appendChild(previewDom);

		// 创建并挂载 Vue 应用
		const app = createApp(ExtPreview, {
			pickCode: this.itemInfo.attributes.pick_code,
			sha1: this.itemInfo.attributes.sha1,
			duration: String(this.itemInfo.duration),
			listScrollBoxNode: this.itemInfo.listScrollBoxNode,
		});
		app.mount(previewDom);
		this.vueApp = app;
	}

	// 销毁
	public destroy() {
		this.vueApp?.unmount();
	}
}
