import type { ShortcutsPreference } from '../../../components/XPlayer/shortcuts/shortcuts.types'
import { useStorage } from '@vueuse/core'
import { merge } from 'lodash'

/** 用户偏好设置类型 */
export interface PlayerPreferences {
  /** 音量 */
  volume: number
  /** 静音 */
  muted: boolean
  /** 播放速率 */
  playbackRate: number
  /** 显示播放列表 */
  showPlaylist: boolean
  /** 自动加载缩略图 */
  autoLoadThumbnails: boolean
  /** 禁用HDR */
  disabledHDR: boolean
  /** 缩略图采样间隔 */
  thumbnailsSamplingInterval: number
  /** 自动播放 */
  autoPlay: boolean
  /** 快捷键偏好 */
  shortcutsPreference: ShortcutsPreference
}

/** 默认偏好设置 */
const DEFAULT_PREFERENCES: PlayerPreferences = {
  volume: 100,
  muted: true,
  playbackRate: 1,
  showPlaylist: false,
  autoLoadThumbnails: true,
  disabledHDR: false,
  thumbnailsSamplingInterval: 60,
  autoPlay: true,
  shortcutsPreference: {
    actionKeyBindings: {},
  },
}

/**
 * 用户偏好设置
 */
export function usePreferences() {
  const preferences = useStorage<PlayerPreferences>(
    'x-player-preferences',
    DEFAULT_PREFERENCES,
    undefined,
    {
      listenToStorageChanges: false,
      mergeDefaults: (storage, defaults) => {
        // deep merge
        return merge(defaults, storage)
      },
    },
  )

  return preferences
}
