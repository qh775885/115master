import FileListMod from "./FileListMod";
import { PageTitleMod } from "./PageTitleMod";

class HomePage {
	private fileListMod!: FileListMod;
	private pageTitleMod!: PageTitleMod;

	constructor() {
		this.init();
	}

	private async init(): Promise<void> {
		this.fileListMod = new FileListMod();
		this.pageTitleMod = new PageTitleMod();
	}

	public destroy(): void {
		this.fileListMod.destroy();
		this.pageTitleMod.destroy();
	}
}

export default HomePage;
