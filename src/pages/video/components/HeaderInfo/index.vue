<template>
  <div v-if="fileInfo.error" :class="styles.container.error">
    <div>❌ 获取文件信息失败</div>
    <div>{{ fileInfo.error }}</div>
  </div>
  <div v-else-if="fileInfo.isLoading || (!fileInfo.isLoading && !fileInfo.isReady)" :class="styles.container.loading">
    <div class="skeleton w-80 h-7 rounded-lg" />
  </div>
  <div v-else :class="styles.container.main">
    <div :class="styles.fileInfo.container">
      <div :class="styles.fileInfo.file">
        <!-- 文件名 -->
        <span :class="styles.fileInfo.name">
          {{ fileInfo.state?.file_name?.toUpperCase() }}
        </span>
        <!-- 收藏按钮 -->
        <button
          v-if="fileInfo.isReady"
          class="swap swap-flip btn-circle"
          :class="[
            {
              'swap-active': !props.isMark,
            },
          ]"
          :title="getActionNameTip(props.ctx, '收藏', 'toggleFavorite')"
          @click="props.onMark"
        >
          <Icon
            class="size-6 swap-off app-text-shadow-dark text-pink-600"
            :icon="ICON_STAR_FILL"
          />
          <Icon
            class="size-6 swap-on app-text-shadow-dark"
            :icon="ICON_STAR"
          />
        </button>
        <!-- 文件大小 -->
        <span :class="styles.fileInfo.size">
          {{ formatFileSize(Number(fileInfo.state?.file_size)) }}
        </span>
      </div>

      <!-- 目录 -->
      <div :class="styles.fileInfo.path.container">
        <ul>
          <li v-for="item in path" :key="item.cid" @click="handleOpenFolder(item.cid)">
            <a>
              {{ item.name }}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ActionKey } from '../../../../components/XPlayer/components/Shortcuts/shortcuts.types'
import type { PlayerContext } from '../../../../components/XPlayer/hooks/usePlayerProvide'
import type { useDataFileInfo } from '../../data/useDataFileInfo'
import type { useDataPlaylist } from '../../data/useDataPlaylist'
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { ICON_STAR, ICON_STAR_FILL } from '../../../../icons'
import { formatFileSize } from '../../../../utils/format'

const props = defineProps<{
  /** 播放器上下文 */
  ctx: PlayerContext
  /** 文件信息 */
  fileInfo: ReturnType<typeof useDataFileInfo>
  /** 播放列表 */
  playlist: ReturnType<typeof useDataPlaylist>
  /** 收藏状态 */
  isMark: boolean
  /** 收藏按钮点击事件 */
  onMark: () => void
}>()

const styles = {
  /** 容器样式 */
  container: {
    main: 'flex items-center gap-4 w-full mx-2',
    error: 'text-red-400',
    loading: 'flex items-center',
  },
  /** 文件信息样式 */
  fileInfo: {
    container: 'flex flex-col flex-1',
    file: 'flex flex-wrap items-center gap-2 tracking-tight',
    name: 'text-xl font-semibold text-base-content line-clamp-2 app-text-shadow-dark',
    size: 'text-xs font-medium text-base-content whitespace-nowrap flex-shrink-0 app-text-shadow-dark tracking-wide',
    path: {
      container: [
        'breadcrumbs',
        'text-xs font-medium text-base-content',
        'tracking-wide',
        'app-text-shadow-dark',
      ],
    },
  },

}

const path = computed(() => {
  return (props.playlist.state?.path ?? []).filter(
    item => Number(item.cid) !== 0,
  )
})

function handleOpenFolder(id: string) {
  window.open(`https://115.com/?cid=${id}&offset=0&tab=&mode=wangpan`, '_blank', 'noreferrer')
}

/** 获取播放列表按钮提示 */
function getActionNameTip(
  ctx: PlayerContext,
  name: string,
  actionKey: ActionKey,
) {
  const tip = ctx.shortcuts.getShortcutsTip(actionKey)
  return `${name}${tip}`
}
</script>
