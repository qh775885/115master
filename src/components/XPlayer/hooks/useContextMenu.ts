import type { ActionKey } from '../components/Shortcuts/shortcuts.types'
import type { PlayerContext } from './usePlayerProvide'
import { ref, shallowRef } from 'vue'
import {
  ICONS,
} from '../index.const'

export interface ContextMenuItem {
  /**
   * ID
   */
  id: string
  /**
   * 菜单名
   */
  label: string
  /**
   * 图标
   */
  icon?: string
  /**
   * 动作
   * @description 快捷键动作
   */
  action: () => void
  /**
   * 快捷键 ActionKey
   * @description 用于显示快捷键提示
   */
  actionKey?: ActionKey
}

/**
 * 使用右键菜单
 */
export function useContextMenu(ctx: PlayerContext) {
  /** 菜单是否显示 */
  const visible = ref(false)
  /** 菜单位置 */
  const position = shallowRef({ x: 0, y: 0 })
  /** 关于弹窗显示状态 */
  const showAbout = ref(false)
  /** 快捷键弹窗显示状态 */
  const showShortcuts = ref(false)

  /** 菜单项 */
  const menuItems: ContextMenuItem[] = [
    {
      id: 'shortcuts',
      label: '快捷键',
      icon: ICONS.ICON_SHORTCUTS,
      actionKey: 'shortcuts',
      action: () => {
        showShortcuts.value = true
        visible.value = false
      },
    },
    {
      id: 'statistics',
      label: 'Statistics',
      icon: ICONS.ICON_STATISTICS_INFO,
      actionKey: 'statistics',
      action: () => {
        ctx.statistics.toggleVisible()
        visible.value = false
      },
    },
    {
      id: 'about',
      label: '关于',
      icon: ICONS.ICON_ABOUT,
      action: () => {
        showAbout.value = true
        visible.value = false
      },
    },
  ]

  /** 显示菜单 */
  const show = (x: number, y: number) => {
    /** 获取播放器容器的位置 */
    const rootRect = ctx.refs.rootRef.value?.getBoundingClientRect()

    if (rootRect) {
      // 计算相对于播放器容器的位置
      position.value = {
        x: x - rootRect.left,
        y: y - rootRect.top,
      }
    }
    else {
      position.value = { x, y }
    }

    visible.value = true
  }

  /** 隐藏菜单 */
  const hide = () => {
    visible.value = false
  }

  /** 处理右键事件 */
  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault()
    show(event.clientX, event.clientY)
  }

  return {
    visible,
    position,
    menuItems,
    showAbout,
    showShortcuts,
    show,
    hide,
    handleContextMenu,
  }
}
