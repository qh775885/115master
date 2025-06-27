import { ModManager } from "./BaseMod";
import FileListMod from "./FileListMod";
import { TopFilePathMod } from "./TopFilePathMod";
import { TopHeaderMod } from "./TopHeaderMod";
import "./index.css";
class HomePage {
	private modManager: ModManager | undefined = undefined;

	constructor() {
		this.init();
	}

	private async init(): Promise<void> {
		this.modManager = new ModManager([
			new FileListMod(),
			new TopFilePathMod(),
			new TopHeaderMod(),
		]);
	}

	public destroy(): void {
		this.modManager?.destroy();
	}
}

export default HomePage;
