<template>
  <div :class="styles.container.main">
    <!-- Drawer 容器 -->
    <div :class="styles.drawer.main">
      <!-- Drawer toggle checkbox -->
      <input
        id="playlist-drawer"
        type="checkbox"
        :class="styles.drawer.toggle"
        :checked="preferences.showPlaylist"
        @change="togglePlaylist"
      >

      <!-- Drawer content (主内容区域) -->
      <div :class="styles.drawer.content">
        <div :class="styles.container.pageMain">
          <div
            :class="[
              styles.player.container,
              preferences.showPlaylist && styles.player.containerFold,
            ]"
          >
            <!-- 视频播放器 -->
            <XPlayer
              ref="xplayerRef"
              v-model:show-playlist="preferences.showPlaylist"
              v-model:volume="preferences.volume"
              v-model:muted="preferences.muted"
              v-model:playback-rate="preferences.playbackRate"
              v-model:quality="preferences.quality"
              v-model:auto-load-thumbnails="preferences.autoLoadThumbnails"
              v-model:disabled-h-d-r="preferences.disabledHDR"
              v-model:thumbnails-sampling-interval="
                preferences.thumbnailsSamplingInterval
              "
              v-model:auto-play="preferences.autoPlay"
              v-model:shortcuts-preference="preferences.shortcutsPreference"
              :class="[styles.player.video]"
              :style="{
                aspectRatio,
              }"
              :sources="DataVideoSources.list"
              :subtitles="DataSubtitles.state"
              :last-time="DataHistory.lastTime.value"
              :subtitles-loading="DataSubtitles.isLoading"
              :subtitles-ready="DataSubtitles.isReady"
              :shortcuts-ext="extShortcuts"
              :has-previous="hasPrevious"
              :has-next="hasNext"
              :on-thumbnail-request="onThumbnailRequest"
              :on-subtitle-change="handleSubtitleChange"
              :on-timeupdate="handleTimeupdate"
              :on-seeking="handleSeek"
              :on-seeked="handleSeek"
              :on-canplay="handleStartAutoBuffer"
              :on-ended="handleVideoEnded"
              @play-previous="playPrevious"
              @play-next="playNext"
            >
              <template #headerLeft="{ ctx }">
                <HeaderInfo
                  :file-info="DataFileInfo"
                  :playlist="DataPlaylist"
                  :ctx="ctx"
                  :is-mark="DataMark.isMark.value ?? false"
                  :on-mark="handleMark"
                />
              </template>
              <template #headerRight="{ ctx }">
                <div class="flex items-center gap-2">
                  <ControlBox v-if="isMac && DataFileInfo.isReady" @click="handleLocalPlay('iina')">
                    <!-- IINA 播放按钮 -->
                    <button
                      :class="styles.controls.btn.root"
                      :title="getActionNameTip(ctx, 'IINA 播放', 'playWithIINA')"
                    >
                      <img
                        :class="styles.controls.iinaIcon"
                        :src="iinaIcon"
                        alt="IINA"
                      >
                    </button>
                  </ControlBox>

                  <ControlBox>
                    <!-- 播放列表切换按钮 -->
                    <label
                      for="playlist-drawer"
                      :class="[
                        styles.controls.btn.root,
                      ]"
                      :title="
                        getActionNameTip(ctx, '播放列表', 'toggleShowSider')
                      "
                    >
                      <Icon
                        :icon="ICON_PLAYLIST"
                        :class="[styles.controls.btn.icon]"
                      />
                    </label>
                  </ControlBox>
                </div>
              </template>
              <template #aboutContent>
                <About />
              </template>
            </XPlayer>
          </div>
        </div>

        <!-- 页面下方内容 -->
        <div v-if="PLUS_VERSION" :class="styles.container.pageFlow">
          <!-- 电影信息 -->
          <MovieInfo :movie-infos="DataMovieInfo" />
        </div>
      </div>

      <!-- Drawer side (播放列表侧边栏) -->
      <div :class="styles.drawer.side">
        <!-- Drawer overlay -->
        <label
          for="playlist-drawer"
          aria-label="close sidebar"
          :class="styles.drawer.overlay"
        />

        <!-- 播放列表内容 -->
        <Playlist
          :class="styles.playlist"
          :pick-code="params.pickCode.value"
          :playlist="DataPlaylist"
          :visible="preferences.showPlaylist"
          @play="handleChangeVideo"
          @close="handleClosePlaylist"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  ActionKey,
  ActionKeyBindings,
  ActionMap,
  ShortcutsExt,
} from '../../components/XPlayer/components/Shortcuts/shortcuts.types'
import type { PlayerContext } from '../../components/XPlayer/hooks/usePlayerProvide'
import type XPlayerInstance from '../../components/XPlayer/index.vue'
import type { Subtitle, ThumbnailRequest } from '../../components/XPlayer/types'
import type { Entity } from '../../utils/drive115'
import { Icon } from '@iconify/vue'
import { useTitle } from '@vueuse/core'
import { cloneDeep } from 'lodash'
import { computed, h, nextTick, onMounted, ref, shallowRef, toValue } from 'vue'
import iinaIcon from '../../assets/icons/iina-icon.png'
import ControlBox from '../../components/XPlayer/components/Controls/ControlBox.vue'
import { ACTION_GROUPS } from '../../components/XPlayer/components/Shortcuts/shortcuts.const'
import XPlayer from '../../components/XPlayer/index.vue'
import { controlRightStyles } from '../../components/XPlayer/styles/common'
import { formatTime } from '../../components/XPlayer/utils/time'
import { PLUS_VERSION } from '../../constants'
import { useLockFn } from '../../hooks/useLockFn'
import { useParamsVideoPage } from '../../hooks/useParams'
import { ICON_PLAYLIST, ICON_STAR, ICON_STAR_FILL } from '../../icons'
import { subtitlePreference } from '../../utils/cache/subtitlePreference'
import { clsx } from '../../utils/clsx'
import { drive115 } from '../../utils/drive115'
import { formatFileSize } from '../../utils/format'
import { getAvNumber } from '../../utils/getNumber'
import { appLogger } from '../../utils/logger'
import { isMac } from '../../utils/platform'
import { goToPlayer } from '../../utils/route'
import { webLinkIINA, webLinkShortcutsMpv } from '../../utils/weblink'
import About from './components/About/index.vue'
import HeaderInfo from './components/HeaderInfo/index.vue'
import MovieInfo from './components/MovieInfo/index.vue'
import Playlist from './components/Playlist/index.vue'
import { useDataFileInfo } from './data/useDataFileInfo'
import { useDataHistory } from './data/useDataHistory'
import { useMark } from './data/useDataMark'
import { useDataMovieInfo } from './data/useDataMovieInfo'
import { useDataPlaylist } from './data/useDataPlaylist'
import { usePreferences } from './data/usePreferences'
import { useDataSubtitles } from './data/useSubtitlesData'
import { useDataThumbnails } from './data/useThumbnails'
import { useDataVideoSources } from './data/useVideoSource'

const styles = clsx({
  // 容器样式
  container: {
    main: [
      'flex flex-col items-center',
      'min-h-screen gap-5',
      'bg-base-100 text-gray-100',
      'sm:[--app-xplayer-ratio:0.3] md:[--app-xplayer-ratio:0.518] lg:[--app-xplayer-ratio:0.618] 2xl:[--app-xplayer-ratio:0.718]',
      '[--app-playlist-ratio:calc(1-var(--app-xplayer-ratio))]',
      '[--app-xplayer-width:calc(100%*var(--app-xplayer-ratio))]',
      '[--app-playlist-width:calc(100%*var(--app-playlist-ratio))]',
    ],
    showPlaylist: 'show-playlist',
    pageMain: ['relative h-screen w-full overflow-hidden bg-black'],
    pageFlow: 'flex w-full flex-col gap-8 px-6 py-8 xl:px-36',
  },
  // 抽屉样式
  drawer: {
    main: 'drawer drawer-end',
    content: 'drawer-content',
    side: 'drawer-side',
    overlay: 'drawer-overlay',
    toggle: 'drawer-toggle',
  },
  // 播放器样式
  player: {
    container:
      'relative flex h-screen w-full transform-gpu items-center justify-center transition-all duration-200 ease-in-out',
    containerFold: 'w-(--app-xplayer-width)!',
    video: 'absolute m-auto h-full w-full overflow-hidden',
  },
  // 播放列表样式
  playlist: 'w-(--app-playlist-width)!',
  // 控制样式
  controls: {
    btn: controlRightStyles.btn,
    iinaIcon: 'size-7 contrast-200 grayscale invert',
  },
})

/** 日志 */
const logger = appLogger.sub('Video')
/** 播放器 Ref */
const xplayerRef = ref<InstanceType<typeof XPlayerInstance>>()
/** 偏好设置 */
const preferences = usePreferences()
/** 参数 */
const params = useParamsVideoPage()
/** 视频源 */
const DataVideoSources = useDataVideoSources()
/** 缩略图 */
const DataThumbnails = useDataThumbnails(preferences)
/** 字幕 */
const DataSubtitles = useDataSubtitles()
/** 番号信息 */
const DataMovieInfo = useDataMovieInfo()
/** 文件信息 */
const DataFileInfo = useDataFileInfo()
/** 播放列表 */
const DataPlaylist = useDataPlaylist()
/** 历史记录 */
const DataHistory = useDataHistory()
/** 收藏 */
const DataMark = useMark(DataFileInfo)
/** 是否正在切换视频 */
const changeing = shallowRef(false)
/** 视频尺寸 */
const videoSize = computed(() => {
  return {
    width: Number(DataFileInfo.state?.width) ?? 1920,
    height: Number(DataFileInfo.state?.height) ?? 1080,
  }
})
/** 视频比例 */
const videoRatio = computed(() => {
  return videoSize.value.width / videoSize.value.height
})
/** 播放器比例 */
const aspectRatio = computed(() => {
  if (videoRatio.value < 1) {
    return '1/1'
  }

  if (videoRatio.value > 1.78) {
    return '16/10'
  }

  return `${videoSize.value.width} / ${videoSize.value.height}`
})
/** 当前播放列表索引 */
const currentPlaylistIndex = computed(() => {
  if (!DataPlaylist.state || !params.pickCode.value) {
    return -1
  }
  return DataPlaylist.state.data.findIndex(
    item => item.pc === params.pickCode.value,
  )
})
/** 是否有上一集 */
const hasPrevious = computed(() => {
  if (currentPlaylistIndex.value < 0) {
    return undefined
  }
  return currentPlaylistIndex.value > 0
})
/** 是否有下一集 */
const hasNext = computed(() => {
  if (!DataPlaylist.state || currentPlaylistIndex.value < 0) {
    return undefined
  }
  return currentPlaylistIndex.value < DataPlaylist.state.data.length - 1
})
/** 动作映射 */
const ACTION_MAP: ActionMap = {
  toggleFavorite: {
    name: '收藏',
    group: ACTION_GROUPS.EXTERNAL,
    keydown: async (ctx) => {
      await handleMark()
      const title = DataMark.isMark.value ? '已收藏' : '取消收藏'
      const icon = DataMark.isMark.value ? ICON_STAR_FILL : ICON_STAR
      const iconClass = DataMark.isMark.value ? 'text-pink-600' : ''
      ctx.hud?.show({
        title,
        icon,
        iconClass,
      })
    },
  },

  playWithIINA: {
    name: 'IINA 播放',
    group: ACTION_GROUPS.EXTERNAL,
    keydown: (ctx) => {
      handleLocalPlay('iina')
      ctx.hud?.show({
        title: 'IINA 播放',
      })
    },
  },
} satisfies ActionMap
/** 动作键绑定 */
const ACTION_KEY_BINDINGS = {
  toggleFavorite: [],
  playWithIINA: [],
} satisfies ActionKeyBindings
/** 外部动作配置 */
const extShortcuts = {
  actionMap: ACTION_MAP,
  actionKeyBindings: ACTION_KEY_BINDINGS,
} satisfies ShortcutsExt

/** 处理字幕变化 */
async function handleSubtitleChange(subtitle: Subtitle | null) {
  // 保存字幕选择
  await subtitlePreference.savePreference(
    params.pickCode.value ?? '',
    subtitle || null,
  )
}

/** 本地播放 */
async function handleLocalPlay(player: LocalPlayer) {
  if (!params.pickCode.value) {
    throw new Error('pickCode is required')
  }
  const download = await drive115.getFileDownloadUrl(params.pickCode.value)
  switch (player) {
    case 'mpv':
      open(webLinkShortcutsMpv(download))
      break
    case 'iina':
      xplayerRef.value?.interruptSource()
      setTimeout(() => {
        open(webLinkIINA(download))
      }, 300)
      break
  }
}

async function changeVideo(item: Entity.PlaylistItem) {
  try {
    changeing.value = true
    if (!params.cid.value) {
      throw new Error('cid is required')
    }
    goToPlayer({
      cid: params.cid.value,
      pickCode: item.pc,
    })
    params.getParams()
    DataThumbnails.destory()
    DataSubtitles.execute(0, '')
    DataVideoSources.clear()
    DataHistory.clear()
    if (PLUS_VERSION) {
      DataMovieInfo.javDBState.execute(0)
      DataMovieInfo.javBusState.execute(0)
    }
    await nextTick()
    await loadData(false)
  }
  finally {
    changeing.value = false
  }
}

/** 播放器列表切换 */
const handleChangeVideo = useLockFn(changeVideo)

/** 开始自动缓冲缩略图 */
function handleStartAutoBuffer() {
  DataThumbnails.autoBuffer(params.pickCode.value ?? '')
}

/** 处理时间更新 */
function handleTimeupdate(ctx: PlayerContext) {
  if (changeing.value) {
    return
  }
  if (!DataHistory.isinit.value) {
    return
  }
  const time = ctx.playerCore.value?.currentTime ?? 0

  if (time <= 0) {
    return
  }
  DataHistory.handleTimeupdate(time)
  if (!params.pickCode.value) {
    throw new Error('pickCode is required')
  }
  DataPlaylist.updateItemTime(params.pickCode.value, time)
}

/** 处理跳转 */
function handleSeek(ctx: PlayerContext) {
  const time = ctx.playerCore.value?.currentTime ?? 0
  DataHistory.handleSeek(time)
}

/** 关闭播放列表 */
function handleClosePlaylist() {
  preferences.value.showPlaylist = false
}

/** 切换播放列表 */
function togglePlaylist() {
  preferences.value.showPlaylist = !preferences.value.showPlaylist
}

/** 缩略图请求 */
function onThumbnailRequest(
  o: Parameters<ThumbnailRequest>[0],
): ReturnType<ThumbnailRequest> {
  return DataThumbnails.onThumbnailRequest({
    id: params.pickCode.value ?? '',
    ...o,
  })
}

/** 加载数据 */
async function loadData(isFirst = true) {
  const pickCode = toValue(params.pickCode)
  const cid = toValue(params.cid)
  if (!pickCode) {
    throw new Error('pickCode is required')
  }
  if (!params.cid.value) {
    throw new Error('cid is required')
  }
  try {
    await DataHistory.fetch(pickCode)
  }
  catch (error) {
    logger.error(error)
  }

  const task = []

  task.push(
    DataVideoSources.fetch(pickCode).then(async () => {
      // 初始化缩略图
      await DataThumbnails.initialize(
        pickCode,
        cloneDeep(DataVideoSources.list.value),
        preferences.value.thumbnailsSamplingInterval,
      )
    }),
  )

  task.push(
    // 加载文件信息
    DataFileInfo.execute(0, pickCode).then((res) => {
      const avNumber = getAvNumber(res.file_name)
      // 设置标题
      useTitle(DataFileInfo.state.file_name || '')
      // 加载番号信息
      if (avNumber) {
        DataMovieInfo.javDBState.execute(0, avNumber)
        DataMovieInfo.javBusState.execute(0, avNumber)
      }
      // 加载字幕
      DataSubtitles.execute(0, pickCode, res.file_name, avNumber)
    }),
  )

  // 加载播放列表
  if (
    isFirst && cid
  ) {
    task.push(DataPlaylist.execute(0, cid))
  }

  return Promise.allSettled(task)
}

/** 处理收藏 */
async function handleMark() {
  // 切换星标
  await DataMark.toggleMark()
  // 更新播放列表项星标
  DataPlaylist.updateItemMark(
    DataFileInfo.state.pick_code,
    !!DataMark.isMark.value,
  )
}

/**
 * 播放上一集或下一集
 * @param ctx
 * @param dir 方向 -1: 上一集 1: 下一集
 */
async function playPreviousOrNext(ctx: PlayerContext, dir: number) {
  if (!DataPlaylist.state || !params.pickCode.value) {
    return
  }

  const currentIndex = DataPlaylist.state.data.findIndex(
    item => item.pc === params.pickCode.value,
  )

  const nextIndex = currentIndex + dir
  if (nextIndex >= 0 && nextIndex < DataPlaylist.state.data.length) {
    const nextItem = DataPlaylist.state.data[nextIndex]
    handleChangeVideo(nextItem)
    const no = nextIndex + 1
    const len = DataPlaylist.state?.data.length
    const noText = `(${no + 1}/${len})`
    const title = h('div', {
      class: 'text-sm font-semibold',
    }, [
      h('span', {
        class: 'text-lg font-semibold',
      }, nextItem.n),
    ])
    const value = h('div', [
      h(
        'div',
        {
          class: 'flex items-center gap-2',
        },
        [
          h(
            'span',
            {
              class: 'text-xs text-base-content',
            },
            noText,
          ),
          h(
            'span',
            {
              class: 'text-xs text-base-content/70',
            },
            formatTime(nextItem.play_long),
          ),
          h(
            'span',
            {
              class: 'text-xs text-base-content/70',
            },
            formatFileSize(nextItem.s),
          ),
        ],
      ),

    ])
    const icon = ICON_PLAYLIST
    ctx.hud?.show({ title, icon, value })
  }
  else {
    ctx.hud?.show({
      title: '没有更多了',
      icon: ICON_PLAYLIST,
    })
  }
}

/** 播放上一集 */
async function playPrevious(ctx: PlayerContext) {
  playPreviousOrNext(ctx, -1)
}

/** 播放下一集 */
async function playNext(ctx: PlayerContext) {
  playPreviousOrNext(ctx, 1)
}

/** 处理视频播放结束 */
async function handleVideoEnded(ctx: PlayerContext) {
  /** 自动播放下一集 */
  if (hasPrevious.value) {
    await playNext(ctx)
  }
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

// 挂载
onMounted(async () => {
  await loadData()
})
</script>
