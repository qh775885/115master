// 使用示例:
// const logger = new Logger('MyApp', 'UserModule');
// logger.info('login', '用户登录成功');
// 输出: MyApp UserModule login: 用户登录成功 (带有相应的颜色)
export class Logger {
	private appName: string;
	private moduleName: string;

	constructor(appName: string, moduleName: string) {
		this.appName = appName;
		this.moduleName = moduleName;
	}

	private formatMessage(logName: string, ...args: unknown[]): string[] {
		return [
			`%c${this.appName}%c ${this.moduleName}%c ${logName}%c ${args}`,
			"color: #409EFF; font-weight: bold", // appName 样式：蓝色
			"color: #67C23A; font-weight: bold", // moduleName 样式：绿色
			"color: #E6A23C; font-weight: bold", // logName 样式：黄色
			"color: inherit; margin-top: 4px", // 恢复默认样式
		];
	}

	log(logName: string, ...args: unknown[]): void {
		if (
			args.length === 0 ||
			typeof args[0] === "string" ||
			typeof args[0] === "number"
		) {
			console.log(...this.formatMessage(logName, ...args));
		} else {
			console.log(...this.formatMessage(logName));
			console.log(...args);
		}
	}

	error(logName: string, msg: unknown): void {
		console.log(...this.formatMessage(logName));
		console.error(msg);
	}
}

export class AppLogger extends Logger {
	constructor(moduleName: string) {
		super("115Master", moduleName);
	}
}
