import { type App, createApp } from "vue";
import mainStyles from "../../../styles/main.css?inline";
import ExtInfo from "../components/ExtInfo/index.vue";
import { FileListType, FileType, type ItemInfo, IvType } from "../types";

// 文件列表扩展信息
export class FileItemExtInfo {
	private vueApp: App | null = null;

	constructor(
		private readonly itemNode: HTMLElement,
		private readonly itemInfo: ItemInfo,
	) {}

	// 加载
	public load() {
		// 如果文件列表类型为网格，则不加载扩展信息
		if (this.itemInfo.fileListType === FileListType.grid) {
			return;
		}

		// 如果视频不可播放且不是文件夹，则不加载扩展信息
		if (
			this.itemInfo.attributes.iv !== IvType.playable &&
			this.itemInfo.attributes.file_type !== FileType.folder
		) {
			return;
		}

		// 如果视频没有番号，则不加载扩展信息
		if (!this.itemInfo.avNumber) {
			return;
		}

		this.itemNode.classList.add("with-ext-info");

		// 创建容器元素
		const extInfoContainer = document.createElement("div");
		extInfoContainer.style.width = "100%";
		this.itemNode.append(extInfoContainer);

		// 创建 shadow DOM
		const shadowRoot = extInfoContainer.attachShadow({ mode: "open" });

		// 在 shadow DOM 中添加样式
		const styleElement = document.createElement("style");
		styleElement.textContent = mainStyles;
		shadowRoot.appendChild(styleElement);

		// 在 shadow DOM 中创建挂载点
		const extInfoDom = document.createElement("div");
		extInfoDom.className = "ext-info-root";
		shadowRoot.appendChild(extInfoDom);

		// 创建并挂载 Vue 应用
		const app = createApp(ExtInfo, {
			avNumber: this.itemInfo.avNumber,
		});
		app.mount(extInfoDom);
		this.vueApp = app;
	}

	// 销毁
	public destroy() {
		this.vueApp?.unmount();
	}
}
