<template>
  <div :class="styles.playlist.container">
    <div :class="styles.playlist.header.root">
      <div :class="styles.playlist.header.title">
        <Icon :icon="ICON_PLAYLIST" class="size-8" />
        播放列表
        <span
          v-if="playlist.state?.data?.length && playlist.state?.data?.length > 0"
          :class="styles.playlist.header.count"
        >({{ playlist.state?.data.length }})</span>
      </div>
      <button :class="styles.playlist.header.close">
        <Icon :icon="ICON_CLOSE" :class="styles.playlist.header.closeIcon" @click="emit('close')" />
      </button>
    </div>

    <div v-if="playlist.error" :class="styles.playlist.content">
      <LoadingError :message="playlist.error" />
    </div>
    <div v-else-if="playlist.isLoading || (!playlist.isLoading && !playlist.isReady)" :class="styles.playlist.content">
      <div class="skeleton h-24 w-full rounded-lg" />
    </div>
    <div
      v-else
      ref="playlistRef"
      class="custom-scrollbar" :class="[styles.playlist.content]"
    >
      <PlaylistItem
        v-for="item in playlist.state?.data"
        ref="playlistItemRefs"
        :key="item.pc"
        :item="item"
        :active="item.pc === pickCode"
        @play="handlePlay"
      />
      <div :class="styles.playlist.divider">
        没有更多了
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Entity } from '../../../../utils/drive115'
import type { useDataPlaylist } from '../../data/useDataPlaylist'
import type PlaylistItemVue from './item.vue'
import { Icon } from '@iconify/vue'
import { nextTick, shallowRef, useTemplateRef, watch } from 'vue'
import LoadingError from '../../../../components/LoadingError/index.vue'
import { ICON_CLOSE, ICON_PLAYLIST } from '../../../../icons'
import PlaylistItem from './item.vue'

const props = defineProps<{
  playlist: ReturnType<typeof useDataPlaylist>
  pickCode?: string
}>()

const emit = defineEmits<{
  (e: 'play', item: Entity.PlaylistItem): void
  (e: 'close'): void
}>()

/** 样式常量定义 */
const styles = {
  playlist: {
    container: [
      'relative flex flex-col text-white box-border h-full',
      'bg-base-100',
      'border-l border-base-300/15',
      '[--app-playlist-space:calc(var(--spacing)*4)]',
      '[--app-playlist-header-height:calc(var(--spacing)*16)]',
    ],
    header: {
      root: [
        'absolute inset-x-0 top-0 z-1',
        'flex items-center justify-between flex-shrink-0',
        'h-(--app-playlist-header-height)',
        'px-(--app-playlist-space) py-4',
        'text-base-content',
        'bg-base-100/60',
        'backdrop-blur-2xl backdrop-saturate-200 backdrop-brightness-50',
      ],
      title: 'flex items-center text-xl gap-2.5',
      count: 'text-xs text-base-content/50',
      close: 'btn btn-ghost btn-circle',
      closeIcon: 'size-8',
    },
    content: [
      'flex flex-col gap-5 flex-1',
      'overflow-y-auto',
      'px-(--app-playlist-space) pb-5 pt-[calc(var(--app-playlist-header-height)+var(--spacing)*5)]',
      '[&::-webkit-scrollbar-track]:mt-(--app-playlist-header-height)',
    ],
    divider: 'divider w-1/3 mx-auto text-base-content/30',
  },
}

const playlistRef = shallowRef<HTMLElement | null>(null)
const playlistItemRefs
  = useTemplateRef<InstanceType<typeof PlaylistItemVue>[]>('playlistItemRefs')

/** 点击播放 */
function handlePlay(item: Entity.PlaylistItem) {
  if (item.pc === props.pickCode) {
    return
  }
  emit('play', item)
}

/**
 * 滚动到激活的项目
 */
async function scrollToActiveItem(withAnimation = true) {
  await nextTick()

  if (!playlistItemRefs.value)
    return

  /** 查找激活的项目 */
  const activeItemRef = playlistItemRefs.value.find(ref => ref.$props.active)
  if (!activeItemRef)
    return

  activeItemRef.$el.scrollIntoView({
    behavior: withAnimation ? 'smooth' : 'instant',
    block: 'center',
  })
}

/** 监听 pickCode 的变化，滚动到激活的项目 */
watch(
  [() => props.playlist.state],
  () => scrollToActiveItem(false),
)

watch(
  () => props.pickCode,
  () => scrollToActiveItem(true),
)
</script>
