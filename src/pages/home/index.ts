import { AppLogger } from "../../utils/logger";
import FileListMod from "./FileListMod";
import { FileOperationMenu } from "./FileOperationMenu";

class HomePage {
	private readonly logger: AppLogger;
	private fileOperationMenu!: FileOperationMenu;
	private ileListMod!: FileListMod;

	constructor() {
		this.logger = new AppLogger("HomePage");
		this.init();
	}

	private init(): void {
		this.logger.log("init");
		this.fileOperationMenu = new FileOperationMenu();
		this.ileListMod = new FileListMod();
	}

	public destroy(): void {
		this.fileOperationMenu.destroy();
		this.ileListMod.destroy();
	}
}

export default HomePage;
