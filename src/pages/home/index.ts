import FileListMod from "./FileListMod";
import { TopFilePathMod } from "./TopFilePathMod";
import { TopHeaderMod } from "./TopHeaderMod";
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
//
// https://115.com/?ct=file&ac=userfile&tpl=view_large&s=0&is_wl_tpl=1&aid=1&cid=3013116589290552633&offset=0&limit=24&tab=
