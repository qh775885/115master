<template>
  <button
    ref="buttonRef"
    :class="[styles.btn.root]"
    :data-tip="subtitleTip"
    :disabled="subtitles.loading.value || !subtitles.ready.value || subtitles.list.value?.length === 0"
    @click="toggleMenu"
  >
    <!-- loading -->
    <Icon
      v-if="subtitles.loading.value || !subtitles.ready.value"
      :class="[styles.btn.icon]"
      :icon="ICON_LOADING"
    />
    <!-- found 字幕 -->
    <Icon
      v-else
      :icon="subtitles.current.value ? ICON_SUBTITLES : ICON_SUBTITLES_OFF"
      :class="[styles.btn.icon]"
      :disabled="subtitles.list.value?.length === 0"
    />
  </button>

  <Popup
    v-model:visible="menuVisible"
    :trigger="buttonRef"
    placement="top"
  >
    <ul :class="[styles.menu.root]">
      <li
        v-for="item in menuItems"
        :key="item.id"
      >
        <a
          :class="[
            styles.menu.a,
            {
              [styles.menu.active]: item.value?.id === subtitles.current.value?.id,
            },
          ]"
          :title="item.label"
          @click="handleSubtitleSelect(item.value)"
        >
          <Icon v-if="item.icon" :class="[styles.menu.icon]" :icon="item.icon" />
          <template v-if="item.id !== -1">
            <SubtitleDisplay
              class="flex-1 min-w-0"
              :label="item.label"
              :format="item.raw?.format"
              :source="item.value?.source"
              :subtitle-index="item.index"
              :total="subtitles.total.value"
            />
            <button
              v-if="item.value"
              type="button"
              :class="[styles.menu.action]"
              :title="`查看 ${item.label}`"
              @click.stop="viewSubtitle(item.value)"
            >
              <Icon :class="[styles.menu.actionIcon]" :icon="ICON_VIEW" />
            </button>
            <button
              v-if="item.value"
              type="button"
              :class="[styles.menu.action]"
              :title="`下载 ${item.label}`"
              @click.stop="downloadSubtitle(item.value)"
            >
              <Icon :class="[styles.menu.actionIcon]" :icon="ICON_DOWNLOAD" />
            </button>
          </template>
          <template v-else>
            <span :class="[styles.menu.label]">{{ item.label }}</span>
          </template>
        </a>
      </li>
    </ul>
  </Popup>
</template>

<script setup lang="ts">
import type { Subtitle } from '../../types'
import { Icon } from '@iconify/vue'
import { computed, shallowRef } from 'vue'
import { usePlayerContext } from '../../hooks/usePlayerProvide'
import { controlStyles } from '../../styles/common'
import {
  ICON_DOWNLOAD,
  ICON_LOADING,
  ICON_SUBTITLES,
  ICON_SUBTITLES_OFF,
  ICON_VIEW,
} from '../../utils/icon'
import Popup from '../Popup/index.vue'
import SubtitleDisplay from '../SubtitleDisplay.vue'

const styles = {
  menu: {
    ...controlStyles.menu,
    root: [
      controlStyles.menu.root,
      'max-h-72 max-w-xl overflow-y-auto overflow-x-hidden !flex-nowrap',
    ],
    a: [controlStyles.menu.a, 'flex items-center py-2 w-full gap-2'],
    label: [controlStyles.menu.label, 'w-xs line-clamp-2'],
    action: ['btn btn-circle btn-xs btn-soft flex-shrink-0'],
    actionIcon: ['size-5'],
  },
  btn: controlStyles.btn,
}

const { subtitles, shortcuts } = usePlayerContext()
const menuVisible = shallowRef(false)
const buttonRef = shallowRef<HTMLElement>()

const NAME = '字幕'

const subtitleTip = computed(() => {
  if (!subtitles.list.value?.length)
    return '未找到字幕'

  const tip = shortcuts.getShortcutsTip('toggleSubtitle')
  return `${NAME}${tip}`
})

const menuItems = computed(() => {
  return [
    {
      id: -1,
      label: '关闭字幕',
      value: null,
      icon: ICON_SUBTITLES_OFF,
      raw: undefined,
      index: null,
    },
    ...(subtitles.list.value ?? []).map((item, idx) => ({
      id: item.url,
      label: item.label,
      value: item,
      icon: undefined,
      raw: item,
      index: idx + 1,
    })),
  ]
})

/**
 * 创建字幕文件BlobUrl
 */
async function createSubtitleBlobUrl(subtitle: Subtitle): Promise<string> {
  const blob = subtitle.raw
  if (!blob) {
    throw new Error('无法创建字幕文件: 原始字幕数据不存在')
  }
  const blobRe = new Blob([blob], { type: 'text/plain;charset=utf-8' })
  return URL.createObjectURL(blobRe)
}

/**
 * 下载字幕
 */
async function downloadSubtitle(subtitle: Subtitle) {
  const blobUrl = await createSubtitleBlobUrl(subtitle)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = `${subtitle.label}.${subtitle.format}`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(blobUrl)
}

/**
 * 查看字幕
 */
async function viewSubtitle(subtitle: Subtitle) {
  const blobUrl = await createSubtitleBlobUrl(subtitle)

  if (!blobUrl) {
    console.warn('查看字幕失败: 无法创建字幕文件')
    return null
  }

  const newWin = window.open(blobUrl, '_blank')

  if (!newWin) {
    window.location.href = blobUrl
  }
}

function toggleMenu() {
  menuVisible.value = !menuVisible.value
}

function handleSubtitleSelect(subtitle: Subtitle | null) {
  menuVisible.value = false
  subtitles.change(subtitle)
}
</script>
