import type { Subtitle } from '../../../components/XPlayer/types'
import { useAsyncState } from '@vueuse/core'
import { subtitlePreference } from '../../../utils/cache/subtitlePreference'
import { drive115 } from '../../../utils/drive115'
import { fetchRequest } from '../../../utils/request/fetchRequest'
import { filenameJaccardSimilarity, removeFileExtension } from '../../../utils/string'
import { subtitlecat } from '../../../utils/subtitle/subtitlecat'
import { thunderSubtitle } from '../../../utils/subtitle/thunder'

/** 字幕数据 */
export function useDataSubtitles() {
  /** 通过 subtitleCat 获取字幕 */
  const getFromSubtitlecat = async (keyword: string): Promise<Subtitle[]> => {
    if (!keyword) {
      return []
    }
    const res = await subtitlecat.fetchSubtitle(keyword, 'zh-CN')
    const subtitles = res.map(subtitle => ({
      id: subtitle.id,
      label: subtitle.title,
      srclang: subtitle.targetLanguage,
      source: 'Subtitle Cat',
      raw: subtitle.raw,
      format: subtitle.format,
      kind: 'subtitles' as const,
    } satisfies Subtitle))
    return subtitles
  }

  /** 通过迅雷获取字幕 */
  const getFromThunder = async (filename: string): Promise<Subtitle[]> => {
    if (!filename) {
      return []
    }
    const res = await thunderSubtitle.fetchSubtitle(filename)
    const subtitles = res.map(subtitle => ({
      id: subtitle.id,
      label: `${removeFileExtension(subtitle.title)}${subtitle.extraName ? ` ${subtitle.extraName}` : ''}`,
      srclang: 'zh-CN',
      source: 'Thunder',
      raw: subtitle.raw,
      format: subtitle.format,
      kind: 'subtitles' as const,
    } satisfies Subtitle))
    return subtitles
  }

  /** 通过 115 获取字幕 */
  const getFrom115 = async (pickcode: string): Promise<Subtitle[]> => {
    const res = await drive115.webApiGetMoviesSubtitle({
      pickcode,
    })
    return Promise.all(
      res.data.list.map(async (subtitle) => {
        const url = new URL(subtitle.url)
        url.protocol = 'https://'
        const res = await fetchRequest.get(url.href)
        const blob = await res.blob()
        return {
          id: subtitle.sid,
          url: url.href,
          raw: blob,
          label: `${removeFileExtension(subtitle.title)}`,
          source: subtitle.file_id ? 'Upload' : 'Built-in',
          srclang: subtitle.language || 'zh-CN',
          format: subtitle.type,
          kind: 'subtitles' as const,
        } satisfies Subtitle
      }),
    )
  }

  /** 排序字幕 */
  const sortSubtitles = (subtitles: Subtitle[], filename: string) => {
    return subtitles.sort((a, b) => {
      const similarityA = filenameJaccardSimilarity(a.label, filename)
      const similarityB = filenameJaccardSimilarity(b.label, filename)
      return similarityB - similarityA
    })
  }

  /**
   * 设置默认字幕
   */
  const setDefaultSubtitle = async (pickcode: string, subtitles: Subtitle[]): Promise<Subtitle[]> => {
    const preference = await subtitlePreference.getPreference(pickcode)
    return subtitles.map((s) => {
      return {
        ...s,
        default: preference ? preference.id === s.id : false,
      }
    })
  }

  /** 字幕数据 */
  const subtitles = useAsyncState<Subtitle[]>(
    async (pickcode: string, filename: string, keyword: string): Promise<Subtitle[]> => {
      /** 并行获取所有来源的字幕 */
      const [subtitleCats, thunderSubs, subtitles115] = await Promise.all([
        getFromSubtitlecat(keyword),
        getFromThunder(filename),
        getFrom115(pickcode),
      ])

      const subtitles = await setDefaultSubtitle(
        pickcode,
        [
          ...sortSubtitles(subtitleCats, filename),
          ...sortSubtitles(thunderSubs, filename),
          ...sortSubtitles(subtitles115, filename),
        ],
      )
      return subtitles
    },
    [],
    {
      immediate: false,
    },
  )

  return subtitles
}
