/**
 * 获取文件扩展名
 * @param filename 文件url
 * @returns 文件扩展名, eg: mp4, m3u8, ts, flv, avi, mkv
 */
export const getFileExtensionByUrl = (url: string) => {
	const newUrl = new URL(url);
	const result = newUrl.pathname.split(".").pop();
	return result;
};
