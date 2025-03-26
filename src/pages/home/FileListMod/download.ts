import { drive115 } from "../../../utils/drive115";
import { is115Browser } from "../../../utils/platform";
import type { ItemInfo } from "../types";

export class FileListDownload {
	constructor(
		private readonly itemNode: HTMLElement,
		private readonly itemInfo: ItemInfo,
	) {}

	get fileOprNode() {
		return this.itemNode.querySelector<HTMLElement>(".file-opr");
	}

	get downloadOneNode() {
		return this.fileOprNode?.querySelector<HTMLElement>(
			'a[menu="download_one"]',
		);
	}

	get downloadDirOneNode() {
		return this.fileOprNode?.querySelector<HTMLElement>(
			'a[menu="download_dir_one"]',
		);
	}

	// 加载
	public load() {
		if (!this.fileOprNode) {
			return;
		}

		if (is115Browser) {
			return;
		}

		if (this.downloadDirOneNode) {
			this.downloadDirOneNode.onclick = async (e) => {
				e.stopImmediatePropagation();
				e.preventDefault();

				alert("当前未支持文件夹下载");
			};
		}

		if (this.downloadOneNode) {
			this.downloadOneNode.onclick = async (e) => {
				e.stopImmediatePropagation();
				e.preventDefault();

				try {
					const res = await drive115.getFileDownloadUrl(
						this.itemInfo.attributes.pick_code,
					);
					if (res.url.url) {
						window.open(res.url.url, "_blank");
						return;
					}

					throw new Error("下载失败");
				} catch (error: unknown) {
					if (error instanceof Error) {
						alert(error.message);
					} else {
						alert("下载失败");
					}
				}
			};
		}
	}

	// 销毁
	public destory() {}
}
