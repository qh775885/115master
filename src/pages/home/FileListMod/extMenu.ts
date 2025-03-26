import { GM_openInTab } from "$";
import { VOD_URL_115 } from "../../../constants/115";
import { drive115 } from "../../../utils/drive115";
import { isMac } from "../../../utils/platform";
import { goToPlayer } from "../../../utils/route";
import { webLinkIINA } from "../../../utils/weblink";
import { FileListType, type ItemInfo } from "../types";

interface ButtonConfig {
	class: string;
	title: string;
	text: string;
	visible: boolean;
	click: () => void;
}

// 文件列表扩展菜单
export class FileItemExtMenu {
	constructor(
		private readonly itemNode: HTMLElement,
		private readonly itemInfo: ItemInfo,
	) {}

	get buttonConfig(): ButtonConfig[] {
		return [
			{
				class: "115-player",
				title: "使用【115官方播放器】",
				text: "5️⃣ 官方播放",
				visible: this.itemInfo.filePlayable,
				click: () => {
					GM_openInTab(
						new URL(
							`/?pickcode=${this.itemInfo.attributes.pick_code}&share_id=0`,
							VOD_URL_115,
						).href,
						{ active: true },
					);
				},
			},
			...(isMac
				? [
						{
							class: "iina-player",
							title: "使用【iina】",
							text: "🎵 iina 播放",
							visible: this.itemInfo.filePlayable,
							click: async () => {
								try {
									const download = await drive115.getFileDownloadUrl(
										this.itemInfo.attributes.pick_code,
									);
									open(webLinkIINA(download));
								} catch (error) {
									alert("打开iina失败");
								}
							},
						},
					]
				: []),
			{
				class: "master-player",
				title: "使用【Master播放器】",
				text: "▶️ Master 播放",
				visible: this.itemInfo.filePlayable,
				click: () => {
					goToPlayer(
						{
							pickCode: this.itemInfo.attributes.pick_code,
							cid: this.itemInfo.attributes.cid,
						},
						true,
					);
				},
			},
		];
	}

	get fileOprNode() {
		return (
			this.itemNode.querySelector(".file-opr") ??
			this.itemNode.querySelector(".file-opt")
		);
	}

	// 创建文件操作菜单按钮
	private createButtons(): void {
		this.buttonConfig.forEach((button) => {
			if (!button.visible) return;
			const link = this.createNormalItemButtonElement(button);
			this.fileOprNode?.prepend(link);
			link.addEventListener("mousedown", async (e: MouseEvent) => {
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();
				button.click();
			});
		});
	}

	// 创建普通文件项按钮元素
	private createNormalItemButtonElement(
		button: ButtonConfig,
	): HTMLAnchorElement {
		const link = document.createElement("a");
		link.href = "javascript:void(0)";
		link.className = button.class;
		link.title = button.title;
		link.style.cssText =
			"pointer-events: all; position: relative; z-index: 1000;";

		const span = document.createElement("span");
		span.textContent = button.text;
		span.style.pointerEvents = "none";
		link.appendChild(span);
		return link;
	}

	// 加载
	public load() {
		// 如果文件列表类型为网格，则不加载扩展菜单
		if (this.itemInfo.fileListType === FileListType.grid) {
			return;
		}

		this.createButtons();
	}

	// 销毁
	public destroy() {}
}
