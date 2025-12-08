import { jaccardSimilarity } from './array'

/**
 * 计算文件名的 Jaccard 相似度
 * @param filename 文件名
 * @param subtitle 字幕名
 * @returns 相似度
 */
export function filenameJaccardSimilarity(filename: string, subtitle: string) {
  return jaccardSimilarity(filename.split(''), subtitle.split(''))
}

/**
 * 删除文件扩展名
 * @param filename 文件名
 * @returns 删除扩展名后的文件名
 * @expample
 * ```ts
 *  removeFileExtension('example.txt') // 'example'
 *  removeFileExtension('archive.tar.gz') // 'archive.tar'
 * ```
 */
export function removeFileExtension(filename: string) {
  return filename.replace(/\.[^/.]+$/, '')
}
