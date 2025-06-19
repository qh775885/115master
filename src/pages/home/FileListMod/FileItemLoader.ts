import { PLUS_VERSION } from "../../../constants";
import { getAvNumber } from "../../../utils/getNumber";
import { getDuration } from "../../../utils/time";
import {
	type FileItemAttributes,
	type FileListType,
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

/**
 * 文件列表 Item 修改加载器
 */
export class FileItemModLoader {
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
		private readonly listScrollBoxNode: HTMLElement,
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

	// 获取视频时长节点
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
			listScrollBoxNode: this.listScrollBoxNode,
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
		this.download?.destory();
	}
}
