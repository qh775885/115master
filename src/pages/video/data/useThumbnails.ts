import type {
  ThumbnailFrame,
  VideoSource,
} from '../../../components/XPlayer/types'
import type { LaneConfig } from '../../../utils/scheduler'
import type { usePreferences } from './usePreferences'
import { tryOnUnmounted } from '@vueuse/core'
import { chain } from 'lodash'
import { shallowRef } from 'vue'
import { FRIENDLY_ERROR_MESSAGE } from '../../../constants'
import { intervalArray } from '../../../utils/array'
import { M3U8ClipperNew } from '../../../utils/clipper/m3u8Clipper'
import { getImageResize } from '../../../utils/image'
import {

  Scheduler,
  SchedulerError,
} from '../../../utils/scheduler'
import { blurTime } from '../../../utils/time'

/** 缩略图生成器配置 */
const CLIPPER_OPTIONS = {
  maxWidth: 320,
  maxHeight: 320,
}

/** 车道配置 */
const LANE_CONFIG: Record<string, LaneConfig> = {
  // 缓冲车道
  buffer: {
    name: 'buffer',
    priority: 2,
    maxConcurrent: 4,
  },
}

/** 任务调度器配置 */
const SCHEDULER_OPTIONS = {
  // 最大并发数
  maxConcurrent: 4,
  // 最大队列长度
  maxQueueLength: 1000,
  // 车道配置
  laneConfig: LANE_CONFIG,
}

/** 默认最大采样间隔 */
const DEFAULT_SAMPLING_INTERVAL = 30

/** 最小采样间隔（秒） */
const MIN_SAMPLING_INTERVAL = 2

/** 最小采样数量 */
const MIN_SAMPLING_COUNT = 100

/** 最大采样数量 */
const MAX_SAMPLING_COUNT = 300

/**
 * 缩略图生成
 * @param preferences 偏好设置
 */
export function useDataThumbnails(
  preferences: ReturnType<typeof usePreferences>,
) {
  const currentId = shallowRef<string | undefined>(undefined)

  /** 缩略图生成器 */
  let clipper: M3U8ClipperNew

  /** 任务调度器 */
  const scheduler = new Scheduler<ThumbnailFrame | null>(SCHEDULER_OPTIONS)

  /** 初始化缩略图生成器 */
  const isInited = shallowRef(false)

  /** 是否执行过自动缓冲 */
  const isAutoBufferExecuted = shallowRef(false)

  /** 采样间隔 */
  const samplingInterval = shallowRef(DEFAULT_SAMPLING_INTERVAL)

  /** 缓存缩略图 */
  const cahceThumbnails = new Map<number, ThumbnailFrame>()

  /** 错误 */
  const state = shallowRef<{
    error: Error | unknown | undefined
  }>({
    error: undefined,
  })

  /** 找到最低画质的 HLS 源 */
  const findLowestQualityHLS = (sources: VideoSource[]): VideoSource | null => {
    let lowestQuality: VideoSource | null = null
    sources.forEach((source) => {
      if (source.type === 'hls') {
        if (!lowestQuality || source.quality < lowestQuality.quality) {
          lowestQuality = source
        }
      }
    })
    return lowestQuality
  }

  /**
   * 动态计算采样间隔
   * @description 根据视频时长和传入的间隔，动态调整采样间隔，确保生成的缩略图数量不会太少
   * @param duration 视频时长（秒）
   * @param initialInterval 初始采样间隔（秒）
   * @returns 调整后的采样间隔（秒）
   */
  const calculateSamplingInterval = (
    duration: number,
    initialInterval: number,
  ): number => {
    const count = Math.max(MIN_SAMPLING_COUNT, Math.min(duration / initialInterval, MAX_SAMPLING_COUNT))
    return Math.max(MIN_SAMPLING_INTERVAL, Math.min(duration / count, initialInterval))
  }

  /**
   * 缩略图最大采样间隔
   * @description 初始化缩略图生成器，根据视频源的画质，选择最低画质的 HLS 源，并设置缩略图最大采样间隔
   * @param id 唯一标识 (可以是 pickcode )
   * @param sources 视频源
   * @param interval 缩略图最大采样间隔
   */
  const initialize = async (id: string, sources: VideoSource[], interval: number) => {
    currentId.value = id
    try {
      isInited.value = false
      const source = findLowestQualityHLS(sources)
      if (!source) {
        throw FRIENDLY_ERROR_MESSAGE.CANNOT_VIDEO_COVER_WITHOUT_TRANSCODING
      }
      clipper = new M3U8ClipperNew({
        url: source.url,
      })
      await clipper.open()

      /** 动态计算采样间隔，根据视频时长调整 */
      const initialInterval = interval ?? DEFAULT_SAMPLING_INTERVAL
      samplingInterval.value = calculateSamplingInterval(
        clipper.hlsIo.duration,
        initialInterval,
      )

      console.table({
        'M3U8 分片数量': clipper.hlsIo.segments.length,
        'M3U8 总时长': clipper.hlsIo.duration,
        '最大采样间隔': initialInterval,
        '实际采样间隔': samplingInterval.value,
        '需要采集的缩略图数量': Math.ceil(clipper.hlsIo.duration / samplingInterval.value),
      })

      isInited.value = true
    }
    catch (error) {
      if (currentId.value !== id) {
        return
      }
      state.value.error = error
    }
  }

  /**
   * 获取指定时间点的缩略图
   * @description 获取指定时间点的缩略图，根据模糊处理后的时间，请求缩略图，并返回缩略图
   * @param id 唯一标识 (可以是 pickcode )
   * @param seekTime 实际时间
   * @param seekBlurTime 模糊处理后的时间
   * @returns 缩略图
   */
  const seekThumbnail = async (
    id: string,
    seekTime: number,
    seekBlurTime: number,
  ): Promise<ThumbnailFrame> => {
    const result = await clipper.seek(seekBlurTime, false)
    if (!result) {
      return
    }

    if (currentId.value !== id) {
      result.videoFrame.close()
      return
    }

    /** 获取缩略图尺寸 */
    const resize = getImageResize(
      result.videoFrame.displayWidth,
      result.videoFrame.displayHeight,
      CLIPPER_OPTIONS.maxWidth,
      CLIPPER_OPTIONS.maxHeight,
    )

    /** 创建缩略图 */
    const imageBitmap = await createImageBitmap(result.videoFrame, {
      resizeQuality: 'pixelated',
      resizeWidth: resize.width,
      resizeHeight: resize.height,
    })
    const thumbnail: ThumbnailFrame = {
      img: imageBitmap,
      seekTime,
      seekBlurTime,
      frameTime: result.frameTime,
      consumedTime: result.consumedTime,
    }
    result.videoFrame.close()

    // DEBUG INFO
    // console.log(`
    //   ## seekThumbnail
    //   seekTime: ${seekTime}
    //   seekBlurTime: ${seekBlurTime}
    //   samplingInterval: ${samplingInterval.value}
    //   consumedTime: ${result.consumedTime}
    //   frameTime: ${result.frameTime}
    // `)

    // 缓存缩略图
    cahceThumbnails.set(seekBlurTime, thumbnail)
    // 返回缩略图
    return thumbnail
  }

  /**
   * 处理来自播放器的缩略图请求
   * @description 处理来自播放器的缩略图请求，如果不是最后一次请求，则返回缓存中的缩略图
   */
  const onThumbnailRequest = async (options: {
    id: string
    time: number
    isLast: boolean
  } = {
    id: '',
    time: 0,
    isLast: false,
  }): Promise<ThumbnailFrame> => {
    const { id, time, isLast } = options

    if (state.value.error) {
      throw state.value.error
    }

    if (!isInited || Number.isNaN(time)) {
      return
    }

    /** 计算请求时间 */
    const seekBlurTime = blurTime(
      time,
      samplingInterval.value,
      clipper.hlsIo.duration,
    )

    /** 如果缓存中存在，则返回缓存 */
    const cache = cahceThumbnails.get(seekBlurTime)
    if (cache) {
      return cache
    }

    if (!isLast) {
      return
    }

    // 请求缩略图
    return await seekThumbnail(id, time, seekBlurTime)
  }

  /** 自动加载缩略图 */
  const autoBuffer = async (id: string) => {
    if (state.value.error) {
      throw state.value.error
    }

    // 如果禁用了自动加载预览图
    if (preferences.value.autoLoadThumbnails === false) {
      return
    }

    // 如果已经执行过自动加载预览图
    if (isAutoBufferExecuted.value) {
      return
    }

    // 设置为已执行
    isAutoBufferExecuted.value = true

    /** 获取所有缩略图时间点 */
    const times = chain(intervalArray(0, clipper.hlsIo.duration, samplingInterval.value))
      .filter(time => !cahceThumbnails.has(time))
      .shuffle()
      .value()

    // 添加任务
    for (const time of times) {
      scheduler
        .add(
          async () => {
            const seekTime = blurTime(
              time,
              samplingInterval.value,
              clipper.hlsIo.duration,
            )
            // 如果缓存中存在，则不请求
            if (cahceThumbnails.has(seekTime)) {
              return null
            }
            return await seekThumbnail(id, time, seekTime)
          },
          {
            id: time.toString(),
            lane: LANE_CONFIG.buffer.name,
            priority: 1,
            immediate: true,
            action: 'unshift',
          },
        )
        .catch((error) => {
          if (!(error instanceof SchedulerError.QueueCleared)) {
            throw error
          }
        })
    }
  }

  /** 释放缓存 */
  const releaseCache = () => {
    cahceThumbnails.forEach((thumbnail) => {
      thumbnail?.img?.close()
    })
    cahceThumbnails.clear()
  }

  /** clear */
  const destory = () => {
    clipper.destroy()
    scheduler.clear()
    releaseCache()
    isInited.value = false
    isAutoBufferExecuted.value = false
  }

  tryOnUnmounted(() => {
    destory()
  })

  return {
    isInited,
    isAutoBufferExecuted,
    initialize,
    autoBuffer,
    onThumbnailRequest,
    destory,
  }
}
