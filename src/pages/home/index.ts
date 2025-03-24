import FileListMod from "./FileListMod";
import { PageTitleMod } from "./PageTitleMod";
import { TopHeaderMod } from "./TopHeaderMod";

class HomePage {
	private fileListMod!: FileListMod;
	private pageTitleMod!: PageTitleMod;
	private topHeaderMod!: TopHeaderMod;

	constructor() {
		this.init();
	}

	private async init(): Promise<void> {
		this.fileListMod = new FileListMod();
		this.pageTitleMod = new PageTitleMod();
		this.topHeaderMod = new TopHeaderMod();
	}

	public destroy(): void {
		this.fileListMod.destroy();
		this.pageTitleMod.destroy();
		this.topHeaderMod.destroy();
	}
}

export default HomePage;
