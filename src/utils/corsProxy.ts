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

                // 转换为VTT格式
                const vtt = convertSrtToVtt(response.responseText);
                
                // 创建blob并生成URL
                const blob = new Blob([vtt], { type: 'text/vtt; charset=utf-8' });
                const url = URL.createObjectURL(blob);
                resolve(url);
            },
            onerror: (error) => {
                reject(error);
            }
        });
    });
}