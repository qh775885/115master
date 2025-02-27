import type { Plugin } from "vite";

/**
 * 创建预处理 URL origin 的插件
 *
 * 该插件用于开发环境下，自动为 CSS 中以 / 开头的 URL 添加当前服务器的 origin
 * 例如：url('/assets/image.png') -> url('http://localhost:5173/assets/image.png')
 *
 * @returns Vite 插件
 */
export function createPreUrlOriginPlugin(): Plugin {
	// 存储服务器 origin
	let serverOrigin = "http://127.0.0.1:5173";

	return {
		name: "pre-url-origin",
		apply: "serve", // 仅在开发服务器模式下应用

		configResolved(config) {
			// 在配置解析后获取服务器信息
			const protocol = config.server.https ? "https" : "http";
			const host =
				typeof config.server.host === "string"
					? config.server.host
					: "127.0.0.1";
			const port = config.server.port || 5173;

			// 处理特殊情况：0.0.0.0 需要转换为 127.0.0.1 才能在浏览器中访问
			serverOrigin = `${protocol}://${host === "0.0.0.0" ? "127.0.0.1" : host}:${port}`;
		},

		config() {
			// 匹配 CSS 中的 url('/path') 格式
			const urlReg = /\burl\((['"])(\/[^\/])/g;

			return {
				css: {
					postcss: {
						plugins: [
							{
								postcssPlugin: "postcss-pre-url-origin",
								Declaration(decl) {
									if (urlReg.test(decl.value)) {
										// 为匹配的 URL 添加服务器 origin
										decl.value = decl.value.replace(
											/\burl\((['"])(\/[^\/])/g,
											`url($1${serverOrigin}$2`,
										);
									}
								},
							},
						],
					},
				},
			};
		},
	};
}
