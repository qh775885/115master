import { getAvNumber } from "../../../utils/getNumber";
import { AppLogger } from "../../../utils/logger";
import "./index.css";
import { type App, createApp } from "vue";
import ExtInfo from "../components/ExtInfo/index.vue";

enum FileType {
	folder = "0",
	file = "1",
}

enum IvType {
	playable = "1",
	unplayable = "0",
}

interface FileItemAttributes {
	c: string;
	iv: IvType;
	title: string;
	hdf: string;
	file_type: FileType;
	pick_code: string;
	is_share: string;
	is_top: string;
	area_id: string;
	p_id: string;
	cate_id: string;
	cate_name: string;
	score: string;
	has_desc: string;
	fl_encode: string;
	fuuid: string;
	shared: string;
	has_pass: string;
	issct: string;
}

class FileItem {
	private vueApp: App | null = null;

	constructor(private readonly $item: HTMLElement) {}

	public get attributes(): FileItemAttributes {
		return Object.fromEntries(
			Array.from(this.$item.attributes).map((attr) => [attr.name, attr.value]),
		) as unknown as FileItemAttributes;
	}

	public async loadExtInfo() {
		if (
			this.attributes.iv !== IvType.playable &&
			this.attributes.file_type !== FileType.folder
		) {
			return;
		}

		const avNumber = getAvNumber(this.attributes.title);
		if (avNumber) {
			this.$item.classList.add("with-ext-info");
			const extInfoDom = document.createElement("div");
			this.$item.append(extInfoDom);
			extInfoDom.className = "ext-info-root";
			const app = createApp(ExtInfo, {
				avNumber,
			});
			app.mount(extInfoDom);
			this.vueApp = app;
		}
	}

	public destroy(): void {
		this.vueApp?.unmount();
	}
}

class FileStyle {
	private readonly logger: AppLogger;
	private $list!: HTMLElement | null;
	private $items!: NodeListOf<HTMLElement> | null;
	private items: FileItem[] = [];
	private offChangePage: (() => void) | null = null;

	constructor() {
		this.logger = new AppLogger("FileStyle");
		this.init();
	}

	private init(): void {
		this.logger.log("init");
		this.initList();
		this.offChangePage = this.onChangePage(() => {
			this.initList();
		});
	}

	private initList(): void {
		this.$list = document.querySelector(".list-contents") ?? null;
		this.$items = this.$list?.querySelectorAll("li") ?? null;

		if (this.$list && this.$items) {
			this.$items.forEach((item) => {
				const fileItem = new FileItem(item);
				fileItem.loadExtInfo();
				this.items.push(fileItem);
			});
		}
	}

	private onChangePage(
		callback: (originUrl: string, currentUrl: string) => void,
	) {
		let lastUrl = window.parent.location.href;
		let observerContent: MutationObserver | null = null;
		const observerUrl = new MutationObserver(() => {
			const url = window.parent.location.href;
			if (url !== lastUrl) {
				observerContent = new MutationObserver(() => {
					observerContent?.disconnect();
					callback(lastUrl, url);
				});
				observerContent.observe(document, {
					subtree: true,
					childList: true,
					characterData: true,
				});
				lastUrl = url;
			}
		});

		observerUrl.observe(document, {
			subtree: true,
			childList: true,
			characterData: true,
		});

		return () => {
			observerUrl.disconnect();
			observerContent?.disconnect();
		};
	}

	private destroyItems(): void {
		this.items.forEach((item) => {
			item.destroy();
		});
		this.items = [];
	}

	public destroy(): void {
		this.logger.log("destroy");
		this.destroyItems();
		this.offChangePage?.();
	}
}

export default FileStyle;
