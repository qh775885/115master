import type { Subtitle } from '../types'
import type { PlayerContext } from './usePlayerProvide'
import { computed, ref, watch } from 'vue'

/**
 * 字幕
 */
export function useSubtitles(ctx: PlayerContext) {
  /** 是否准备就绪 */
  const ready = ref(false)
  /** 当前字幕 */
  const current = ref<Subtitle | null>(null)
  /** 上一个字幕 */
  const previousSubtitle = ref<Subtitle | null>(null)
  /** 默认字幕 */
  const defaultSubtitle = computed(() => {
    return (
      ctx.rootProps.subtitles.value?.find(s => s.default)
      ?? ctx.rootProps.subtitles.value?.[0]
      ?? null
    )
  })

  /** 切换字幕 */
  const change = (subtitle: Subtitle | null) => {
    if (subtitle) {
      previousSubtitle.value = subtitle
    }
    current.value = subtitle
    ctx.rootProps.onSubtitleChange?.(subtitle)
  }

  /** 切换字幕开关 */
  const toggleEnabled = () => {
    if (current.value) {
      change(null)
    }
    else if (previousSubtitle.value) {
      change(previousSubtitle.value)
    }
    else {
      change(defaultSubtitle.value ?? null)
    }
  }

  /** 设置默认字幕 */
  const restoreLastSubtitle = (subtitles: Subtitle[]) => {
    const defaultSubtitle = subtitles.find(s => s.default)
    if (defaultSubtitle) {
      change(defaultSubtitle)
    }
  }

  /** 恢复当前字幕 */
  const restoreCurrentSubtitle = () => {
    if (current.value) {
      change(current.value)
    }
  }

  // 监听字幕列表变化，设置默认字幕
  watch(ctx.rootProps.subtitles, (newSubtitles) => {
    ready.value = true
    if (newSubtitles) {
      restoreLastSubtitle(newSubtitles)
    }
  })

  // 监听视频源变化，设置默认字幕
  watch(
    () => ctx.source?.current,
    (newSource) => {
      if (newSource) {
        restoreCurrentSubtitle()
      }
    },
  )

  /** 当前字幕序号 */
  const currentIndex = computed(() => {
    if (!current.value || !ctx.rootProps.subtitles.value) {
      return null
    }
    const index = ctx.rootProps.subtitles.value.findIndex(
      sub => sub.id === current.value?.id,
    )
    return index !== -1 ? index + 1 : null
  })

  /** 字幕总数 */
  const total = computed(() => {
    return ctx.rootProps.subtitles.value?.length ?? 0
  })

  /** 导航字幕 */
  const navigate = (direction: 1 | -1) => {
    const subtitles = ctx.rootProps.subtitles.value
    if (!subtitles || subtitles.length === 0) {
      return
    }

    /** 如果当前没有字幕，选择边界字幕（下一个选第一个，上一个选最后一个） */
    if (!current.value) {
      const fallbackIndex = direction === 1 ? 0 : subtitles.length - 1
      change(subtitles[fallbackIndex])
      return
    }

    /** 查找当前字幕的索引 */
    const currentIdx = subtitles.findIndex(sub => sub.id === current.value?.id)
    if (currentIdx === -1) {
      /** 当前字幕不在列表中，选择边界字幕 */
      const fallbackIndex = direction === 1 ? 0 : subtitles.length - 1
      change(subtitles[fallbackIndex])
      return
    }

    /** 计算下一个索引 */
    const nextIdx = currentIdx + direction

    /** 检查边界，如果超出边界则关闭字幕 */
    if (nextIdx >= 0 && nextIdx < subtitles.length) {
      change(subtitles[nextIdx])
    }
    else {
      change(null)
    }
  }

  /** 切换到下一个字幕 */
  const next = () => navigate(1)

  /** 切换到上一个字幕 */
  const prev = () => navigate(-1)

  return {
    list: ctx.rootProps.subtitles,
    loading: ctx.rootProps.subtitlesLoading,
    ready: ctx.rootProps.subtitlesReady,
    current,
    currentIndex,
    total,
    change,
    toggleEnabled,
    next,
    prev,
    restoreCurrentSubtitle,
  }
}
