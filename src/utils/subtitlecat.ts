import { GM_xmlhttpRequest } from "$";
import { proxySubTitleFile } from "./corsProxy";
interface Item {
    title: string;
    url: string;
    // stringContent?: string;
    downloads: number;
    comment: 1 | -1 | 0;
    originLanguage: string;
    targetLanguage: string;
}

class Subtitlecat {
    private domain = 'https://subtitlecat.com';
    constructor() {
        this.init();
    }

    init() {
        console.log('Subtitlecat init');
    }

    fetchSubtitleUrl(url: string, language: string): Promise<string | undefined> {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                url,
                method: 'GET',
                onload: async (response) => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.response, 'text/html');
                    let subtitleUrl = doc.querySelector(`#download_${language}`)?.getAttribute('href');

                    resolve(subtitleUrl || undefined);
                },
                onerror: (error) => {
                    reject(error);
                }
            })
        })
    }

    fetchSubtitle(keyword: string, language: string): Promise<Item[]> {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                url: `${this.domain}/index.php?search=${keyword}`,
                method: 'GET',
                onload: async (response) => {
                    console.log(response);
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.response, 'text/html');
                    const rows = doc.querySelectorAll('.sub-table tbody tr');

                    const promises = Array.from(rows).slice(0, 5)
                        .map((item) => {
                            const firstTd = item.querySelector('td:first-child');
                            const link = firstTd?.querySelector('a');
                            const title = link?.textContent || '';
                            const href = link?.getAttribute('href') || '';

                            // 从第一个td提取原始语言
                            const langMatch = firstTd?.textContent?.match(/translated from (\w+)/);
                            const originLanguage = langMatch ? langMatch[1] : '';

                            // 提取评价
                            const hasThumbsDown = item.querySelector('td:nth-child(2) .fa-thumbs-down') !== null;
                            const hasThumbsUp = item.querySelector('td:nth-child(2) .fa-thumbs-up') !== null;
                            const comment = hasThumbsDown ? -1 as const : (hasThumbsUp ? 1 as const : 0 as const);

                            // 提取下载次数
                            const downloadsText = item.querySelector('td:nth-child(3)')?.textContent || '';
                            const downloadsMatch = downloadsText.match(/\d+/);
                            const downloads = downloadsMatch ? parseInt(downloadsMatch[0]) : 0;

                            console.log('search to subtitle', title);

                            return {
                                title,
                                href,
                                downloads,
                                comment,
                                originLanguage,
                                targetLanguage: language
                            };
                        })
                        .filter(item => item.title.match(new RegExp(`\\b${keyword}`, 'i')))
                        .map(async (item) => {
                            let url = await this.fetchSubtitleUrl(`${this.domain}/${item.href}`, language);
                            const proxyUrl = url ? await proxySubTitleFile(this.domain + url) : undefined;
                            console.dir(url);
                            console.log('字幕 URL:', url);
                            console.log('字幕语言:', language);
                            return {
                                ...item,
                                url: proxyUrl!,
                                // stringContent
                            };
                        });

                    const results = (await Promise.all(promises))
                        .filter(item => item.url !== undefined)
                        .sort((a, b) => {
                            // 首先按照 comment 倒序排序
                            if (b.comment !== a.comment) {
                                return b.comment - a.comment;
                            }
                            // comment 相同时按照 downloads 倒序排序
                            return b.downloads - a.downloads;
                        });

                    resolve(results);
                },
                onerror: (error) => {
                    reject(error);
                }
            })
        })
    }
}

export default Subtitlecat;
