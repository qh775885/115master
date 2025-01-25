import { GM_xmlhttpRequest } from "$";
import { convertSrtToVtt } from "./subtitleTo";

/**
 * 代理subtitlecat的srt文件并转换为vtt格式
 * @param url 
 */
export const proxySubTitleFile = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            url: url,
            method: 'GET',
            onload: (response) => {
                const vtt = convertSrtToVtt(response.responseText);
                resolve(vtt);
            },
            onerror: (error) => {
                reject(error);
            }
        });
    });
}