import { ActressFaceDB } from "../../../utils/actressFaceDB";
import { getAvNumber } from "../../../utils/getNumber";
import "./index.css";
import { defer } from "lodash";
import { PLUS_VERSION } from "../../../constants";
import { getDuration } from "../../../utils/time";
import {
	type FileItemAttributes,
	FileListType,
	FileType,
	type ItemInfo,
	IvType,
} from "../types";
import { FileItemActressInfo } from "./actressInfo";
import { FileItemClickPlay } from "./clickPlay";
import { FileListDownload } from "./download";
import { FileItemExtInfo } from "./extInfo";
import { FileItemExtMenu } from "./extMenu";
import { FileItemPreview } from "./preview";

class FileItemLoader {
	// 预览信息
	private preview: FileItemPreview | null = null;
	// 扩展信息
	private extInfo: FileItemExtInfo | null = null;
	// 演员信息
	private actressInfo: FileItemActressInfo | null = null;
	// 扩展菜单
	private extMenu: FileItemExtMenu | null = null;
	// 点击播放
	private clickPlay: FileItemClickPlay | null = null;
	// 下载
	private download: FileListDownload | null = null;

	constructor(
		private readonly itemNode: HTMLElement,
		private readonly fileListType: FileListType,
	) {}

	// 获取属性
	private get attributes(): FileItemAttributes {
		return Object.fromEntries(
			Array.from(this.itemNode.attributes).map((attr) => [
				attr.name,
				attr.value,
			]),
		) as unknown as FileItemAttributes;
	}

	// 获取番号
	private get avNumber(): ItemInfo["avNumber"] {
		return getAvNumber(this.attributes.title);
	}

	// 获取是否可播放
	private get filePlayable(): boolean {
		return (
			this.attributes.file_type === FileType.file &&
			this.attributes.iv === IvType.playable &&
			this.attributes.vdi !== "0"
		);
	}

	private get durationNode(): HTMLElement | null {
		return this.itemNode.querySelector(".duration") ?? null;
	}

	// 获取视频时长
	private get duration(): number {
		return getDuration(this.durationNode?.getAttribute("duration")!);
	}

	// 获取 itemInfo
	private get itemInfo(): ItemInfo {
		return {
			avNumber: this.avNumber,
			attributes: this.attributes,
			filePlayable: this.filePlayable,
			fileListType: this.fileListType,
			duration: this.duration,
		};
	}

	// 加载
	public async load() {
		if (PLUS_VERSION) {
			// 加载扩展信息
			this.extInfo = new FileItemExtInfo(this.itemNode, this.itemInfo);
			this.extInfo.load();
			// 加载演员信息
			this.actressInfo = new FileItemActressInfo(this.itemNode, this.itemInfo);
			this.actressInfo.load();
		}

		// 加载预览信息
		this.preview = new FileItemPreview(this.itemNode, this.itemInfo);
		this.preview.load();

		// 加载扩展菜单
		this.extMenu = new FileItemExtMenu(this.itemNode, this.itemInfo);
		this.extMenu.load();

		// 加载点击播放
		this.clickPlay = new FileItemClickPlay(this.itemNode, this.itemInfo);
		this.clickPlay.load();

		// 加载下载
		this.download = new FileListDownload(this.itemNode, this.itemInfo);
		this.download.load();
	}

	// 销毁
	public destroy(): void {
		this.extInfo?.destroy();
		this.preview?.destroy();
		this.actressInfo?.destroy();
		this.clickPlay?.destroy();
	}
}

/**
 * 文件列表修改器
 */
class FileListMod {
	// 文件列表 ItemMaps
	private fileitemMaps: Map<HTMLLIElement, FileItemLoader> = new Map();
	// 演员头像数据库
	private actressFaceDB: ActressFaceDB | null = null;
	// 文件列表变化监听器
	private observerContent: MutationObserver | null = null;

	constructor() {
		this.init();
	}

	// 初始化
	private async init(): Promise<void> {
		this.actressFaceDB = new ActressFaceDB();
		this.actressFaceDB.init();
		this.updateFileItem();
		this.watchFileItemChange();
	}

	// 获取文件列表dom
	get fileListCellNode() {
		return document.querySelector(".list-cell") ?? null;
	}

	// 获取文件列表类型
	get fileListType(): FileListType {
		const listThumb = this.fileListCellNode?.querySelector(".list-contents");
		if (listThumb) {
			return FileListType.list;
		}
		return FileListType.grid;
	}

	// 获取文件列表dom的li节点
	get fileItemNodes() {
		const nodes = this.fileListCellNode?.querySelectorAll("li");
		return nodes ? new Set(nodes) : null;
	}

	// 监听文件列表变化
	private watchFileItemChange() {
		let observerContent: MutationObserver | null = null;
		observerContent = new MutationObserver(() => {
			this.updateFileItem();
		});
		observerContent.observe(document, {
			childList: true,
			subtree: true,
		});
		this.observerContent = observerContent;
	}

	// 更新文件列表
	private updateFileItem() {
		// 遍历文件列表dom的li节点
		for (const item of this.fileItemNodes ?? []) {
			defer(() => {
				// 如果已经存在，则跳过
				if (this.fileitemMaps.has(item)) {
					return;
				}

				// 创建文件列表item
				const fileItem = new FileItemLoader(item, this.fileListType);
				// 加载文件列表item
				fileItem.load();
				// 设置文件列表item
				this.fileitemMaps.set(item, fileItem);
			});
		}
		// 遍历文件列表item
		for (const [key, value] of this.fileitemMaps.entries()) {
			// 如果文件列表dom的li节点存在，则跳过
			if (this.fileItemNodes?.has(key)) {
				return;
			}
			// 销毁文件列表item
			value.destroy();
			// 删除文件列表item
			this.fileitemMaps.delete(key);
		}
	}

	// 销毁文件列表
	private destroyItems(): void {
		this.fileitemMaps.forEach((item) => {
			item.destroy();
		});
		this.fileitemMaps.clear();
	}

	// 销毁
	public destroy(): void {
		this.observerContent?.disconnect();
		this.destroyItems();
	}
}

export default FileListMod;
