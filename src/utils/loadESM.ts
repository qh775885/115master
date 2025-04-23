import { unsafeWindow } from "$";
import pkg from "../../package.json";
import { CDN_BASE_URL } from "../constants";

// 动态加载 ESM 模块
export const loadESM = async <T>({
	pkgName,
	version,
	path,
	varName,
}: {
	pkgName: string;
	version?: string;
	path: string;
	varName: string;
}): Promise<T> => {
	if (!version) {
		if (pkgName in pkg.dependencies) {
			version = pkg.dependencies[pkgName as keyof typeof pkg.dependencies];
		} else {
			version = "latest";
		}
	}
	// 创建一个动态导入的脚本
	const importScript = `
    	import ${varName} from "${CDN_BASE_URL}/npm/${pkgName}@${version}/${path}";
    	window.${varName} = ${varName};
  `;

	// 创建一个带有 type="module" 的脚本元素
	const blob = new Blob([importScript], { type: "text/javascript" });
	const scriptURL = URL.createObjectURL(blob);

	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.type = "module";
		script.src = scriptURL;

		script.onload = () => {
			// 等待模块加载完成
			const checkModule = () => {
				// @ts-ignore
				if (unsafeWindow[varName]) {
					// @ts-ignore
					resolve(unsafeWindow[varName]);
					URL.revokeObjectURL(scriptURL);
				} else {
					setTimeout(checkModule, 50);
				}
			};
			checkModule();
		};

		script.onerror = (err) => {
			URL.revokeObjectURL(scriptURL);
			reject(new Error(`加载 ${pkgName} 模块失败: ${err}`));
		};

		document.head.appendChild(script);
	});
};
