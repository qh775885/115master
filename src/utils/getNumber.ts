import { AppLogger } from "./logger";

const logger = new AppLogger('getAvNumber');

/**
 * 提取番号
 * @param filename 文件名
 * @returns 提取到的番号，如果没有找到则返回null
 */
export function getAvNumber(filename: string): string | null {
    // 移除文件扩展名和路径
    const name = filename;
    // 清理文件名中的干扰字符
    const cleanName = name

        // 清楚域名(hjd2048.com)
        .replace(/^\[?[a-zA-Z0-9]+\.[a-zA-Z]+\]?@?/g, '')
        // 移除文件扩展名(.mp4)
        .replace(/\.[^\s]+$/, '')
        // 清除中文
        .replace(/[\u4E00-\u9FA5]/g, '')
        // 清除日语
        .replace(/[\u3040-\u309F\u30A0-\u30FF]/g, '')

    logger.log('清理干扰字符', `before:${name} -> after:${cleanName}`);

    // 常见的番号格式正则表达式
    const patterns = [
        // FC2系列 (如 FC2-PPV-123456)
        {
            name: 'FC2系列',
            pattern: /fc2[^\d]*(?:ppv)?[^\d]*(\d{6,7})/i,
            format: (m: RegExpMatchArray) => `FC2-PPV-${m[1]}`
        },

        // HEYZO系列 (如 HEYZO-1234)
        {
            name: 'HEYZO系列',
            pattern: /heyzo[^\d]*(\d{4})/i,
            format: (m: RegExpMatchArray) => `HEYZO-${m[1]}`
        },

        // 麻豆系列 (如 MDX-0123, MKY-NS-001)
        {
            name: '麻豆系列',
            pattern: /(mdx|mky|md)[^\d]*(?:ns)?[^\d]*(\d{3,4})/i,
            format: (m: RegExpMatchArray) => {
                const prefix = m[1].toUpperCase();
                const hasNS = cleanName.toLowerCase().includes('ns');
                return `${prefix}${hasNS ? '-NS' : ''}-${m[2]}`;
            }
        },

        // 一本道系列 or Muramura系列 (如 1pondo-123456_789、muramura-123114_163)
        {
            name: '一本道系列 or Muramura系列',
            pattern: /(\d{6})[\s|_]*(\d{3})/i,
            format: (m: RegExpMatchArray) => `${m[1]}_${m[2]}`
        },

        // Pacopacomama or 10musume系列 (如 10musume-123114_01、pacopacomama-123114_01)
        {
            name: 'Pacopacomama or 10musume系列',
            pattern: /(\d{6})[\s|_]*(\d{2})/i,
            format: (m: RegExpMatchArray) => `${m[1]}_${m[2]}`
        },

        // Heydouga系列 (如 heydouga-4037-123)
        {
            name: 'Heydouga系列',
            pattern: /(\d{4})[\s|-]*(\d{3,4})/i,
            format: (m: RegExpMatchArray) => `${m[1]}-${m[2]}`
        },

        // 加勒比系列 (如 carib-123-456)
        {
            name: '加勒比系列',
            pattern: /(?:carib|caribbean)[^\d]*(\d{3})[^\d]*(\d{3})/i,
            format: (m: RegExpMatchArray) => `CARIB-${m[1]}-${m[2]}`
        },

        // 东京热系列 (如 tokyo-hot-n1234)
        {
            name: '东京热系列',
            pattern: /tokyo[^\d]*hot[^\d]*([a-z])(\d{4})/i,
            format: (m: RegExpMatchArray) => `TOKYO-HOT-${m[1].toUpperCase()}${m[2]}`
        },


        // 特殊格式：字母数字混合 (如 T28-123)
        {
            name: '特殊格式：字母数字混合',
            pattern: /([a-zA-Z]+\d{1,2})-(\d{3})/i,
            format: (m: RegExpMatchArray) => `${m[1].toUpperCase()}-${m[2]}`
        },

        // 标准格式：字母-数字 (如 ABC-123, ABCD-12345)
        {
            name: '标准格式：字母-数字',
            pattern: /([a-zA-Z]{2,5})-?(\d{2,5})(?:c|-c)?/i,
            format: (m: RegExpMatchArray) => {
                return `${m[1].toUpperCase()}-${m[2]}`;
            }
        }
    ];

    // 按照优先级顺序尝试匹配
    for (const { name, pattern, format } of patterns) {
        const match = cleanName.match(pattern);
        if (match) {
            logger.log('match name', name);
            logger.log('match regexp', pattern.toString());
            const result = format(match);
            return result;
        }
    }
    logger.log('找不到番号');
    return null;
}