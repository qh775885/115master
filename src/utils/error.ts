/**
 * 应用错误
 */
export class AppError extends Error {
	/**
	 * 创建应用错误类
	 * @param message 错误消息
	 * @returns 应用错误子类
	 */
	static CreateError(message: string) {
		return class extends AppError {
			constructor() {
				super(message);
			}
		};
	}
}
