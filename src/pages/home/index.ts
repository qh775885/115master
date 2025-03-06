import { AppLogger } from "../../utils/logger";
import { FileOperationMenu } from "./FileOperationMenu";
import FileStyle from "./FileStyle";

class HomePage {
	private readonly logger: AppLogger;
	private fileOperationMenu!: FileOperationMenu;
	private fileStyle!: FileStyle;

	constructor() {
		this.logger = new AppLogger("HomePage");
		this.init();
	}

	private init(): void {
		this.logger.log("init");
		this.fileOperationMenu = new FileOperationMenu();
		this.fileStyle = new FileStyle();
	}

	public destroy(): void {
		this.fileOperationMenu.destroy();
		this.fileStyle.destroy();
	}
}

export default HomePage;
