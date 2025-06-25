import FileListMod from "./FileListMod";
import { TopFilePathMod } from "./TopFilePathMod";
import { TopHeaderMod } from "./TopHeaderMod";
import "./index.css";
class HomePage {
	private fileListMod: FileListMod | null = null;
	private pageTitleMod: TopFilePathMod | null = null;
	private topHeaderMod: TopHeaderMod | null = null;

	constructor() {
		this.init();
	}

	private async init(): Promise<void> {
		this.fileListMod = new FileListMod();
		this.pageTitleMod = new TopFilePathMod();
		this.topHeaderMod = new TopHeaderMod();
	}

	public destroy(): void {
		this.fileListMod?.destroy();
		this.pageTitleMod?.destroy();
		this.topHeaderMod?.destroy();
	}
}

export default HomePage;
