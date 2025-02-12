import { JavBus, JavDB } from '../jav';
import { JSDOM } from 'jsdom';
import { mockJavBusInfoHtml, mockJavDBInfoHtml } from './jav.const';

// 在 Node 环境中模拟 DOMParser
global.DOMParser = class DOMParser {
    parseFromString(string: string, type: string) {
        return new JSDOM(string).window.document;
    }
} as any;

describe('JavParserInfo', () => {

    describe('parseInfo Of Javbus', () => {
        it('should parse info correctly', () => {
            const mockHtml = mockJavBusInfoHtml;
            const javbus = new JavBus({} as any);
            const result = javbus.parseInfo(mockHtml);

            expect(result).toMatchObject({
                avNumber: 'DOKS-615',
                title: 'DOKS-615 美脚がすぎるOLの誘惑黒パンティストッキング 水端あさみ',
                date: 1725120000000,
                duration: 119,
                director: [{
                    name: 'マボロシ子',
                    url: 'https://www.javbus.com/director/8s',
                }],
                actors: [{
                    name: '水端あさみ',
                    url: 'https://www.javbus.com/star/z3v',
                    sex: null
                }],
                studio: [{
                    name: 'OFFICE K’S',
                    url: 'https://www.javbus.com/studio/9b',
                }],
                publisher: [{
                    name: 'OFFICE K’S',
                    url: 'https://www.javbus.com/label/ho',
                }],
                cover: 'https://www.javbus.com/pics/cover/aq21_b.jpg',
                preview: [
                    ...Array(20).fill(0).map((_, index) => ({
                        raw: `https://pics.dmm.co.jp/digital/video/36doks00615/36doks00615jp-${index + 1}.jpg`,
                        thumbnail: `https://www.javbus.com/pics/sample/aq21_${index + 1}.jpg`,
                    })),
                ],
                series: [{
                    name: '美脚がすぎるOLの誘惑黒パンティストッキング',
                    url: 'https://www.javbus.com/series/y77'
                }],
                category: [
                    {
                        name: 'OL',
                        url: 'https://www.javbus.com/genre/18',
                    },
                    {
                        name: '蕩婦',
                        url: 'https://www.javbus.com/genre/10',
                    },
                    {
                        name: '戀腿癖',
                        url: 'https://www.javbus.com/genre/2x',
                    },
                    {
                        name: '淫語',
                        url: 'https://www.javbus.com/genre/24',
                    },
                    {
                        name: '連褲襪',
                        url: 'https://www.javbus.com/genre/28',
                    },
                    {
                        name: '高畫質',
                        url: 'https://www.javbus.com/genre/4o',
                    },
                    {
                        name: '單體作品',
                        url: 'https://www.javbus.com/genre/f',
                    },
                    {
                        name: '4K',
                        url: 'https://www.javbus.com/genre/fd',
                    },
                ],
                score: null,
                scoreCount: null,
                viewCount: null,
                downloadCount: null,
            });
        });
    });

    describe('parseInfo Of JavDB', () => {
        it('should parse info correctly', () => {
            const mockHtml = mockJavDBInfoHtml;
            const javdb = new JavDB({} as any);
            const result = javdb.parseInfo(mockHtml);

            expect(result).toMatchObject({
                avNumber: 'DOKS-615',
                title: '美脚がすぎるOLの誘惑黒パンティストッキング 水端あさみ パンティと生写真付き',
                date: 1725120000000,
                duration: 119,
            });
        });
    });

}); 