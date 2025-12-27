import type { AVCFrame } from '@cbingbing/demuxer'
import type { AvcFrameData } from './demuxerTsNew'
import type { ChunkReader } from './io/ChunkIO'
import type { FetchIO } from './io/FetchIO'
import { appLogger } from '../logger'
import { promiseDelay } from '../promise'
import { DemuxerTsNew } from './demuxerTsNew'
import { microsecTimebase, secTimebase, timebaseConvert } from './timebase'

/**
 * M3U8 视频剪辑器跳转结果
 */
export interface FrameData {
  /** 视频帧 */
  videoFrame: VideoFrame
  /** 帧实际时间(秒) */
  frameTime: number
  /** 请求时间(秒) */
  seekTime: number
  /** 消耗时间(毫秒) */
  consumedTime: number
}

export interface SampleQueueItem extends AvcFrameData {
  encodedChunk: EncodedVideoChunk
}

export interface DecoderFlowOptions {
  /** 目标时间/秒 */
  targetTime: number
  /** 分片 URL */
  segmentUrl: string
  /** 首帧优先 */
  firstFramePriority: boolean
  /** 输入输出流 */
  io: FetchIO
}
/**
 * 解码器流
 * @description 负责管理 VideoDecoder、Demuxer 和解码循环逻辑
 */
export class DecoderFlow {
  protected logger = appLogger.sub('DecoderFlow')
  private videoDecoder: VideoDecoder | undefined
  private demuxer: DemuxerTsNew | undefined
  private sampleQueue: SampleQueueItem[] = []
  private samplesProcessed: SampleQueueItem[] = []
  private frame: VideoFrame | undefined
  private isRunning: boolean = true
  private targetTime: number
  private firstFramePriority: boolean
  private segmentUrl: string = ''
  private firstPts: number | undefined
  private io: FetchIO
  private reader: ChunkReader | undefined
  constructor(
    options: DecoderFlowOptions,
  ) {
    this.targetTime = options.targetTime
    this.segmentUrl = options.segmentUrl
    this.firstFramePriority = options.firstFramePriority
    this.io = options.io
  }

  /**
   * 初始化解码器和解复用器
   */
  initialize(): void {
    this.logger.debug(`initialize 开始, segmentUrl: ${this.segmentUrl}`)
    this.videoDecoder = this._createDecoder()
    this.demuxer = this._createDemuxer()
    this.reader = this.io.createChunkReader(this.segmentUrl, 0)
    this.logger.debug(`initialize 完成, videoDecoder状态: ${this.videoDecoder.state}`)
  }

  /**
   * 推送数据到解复用器
   * @param buffer 数据缓冲区
   * @param done 是否完成
   */
  pushData(buffer: ArrayBuffer, done?: boolean): void {
    if (!this.demuxer) {
      this.logger.warn('pushData demuxer is undefined')
      return
    }

    if (done) {
      this.logger.debug(`pushData 推送最后一块数据, 大小: ${buffer.byteLength} bytes`)
    }
    else {
      // 只在解码器未配置时记录，帮助调试
      if (this.videoDecoder?.state === 'unconfigured') {
        this.logger.debug(`pushData 推送数据到解复用器, 大小: ${buffer.byteLength} bytes, 解码器状态: ${this.videoDecoder.state}`)
      }
    }
    this.demuxer.push(buffer, done ? { done: true } : undefined)
  }

  /**
   * 检查是否已找到帧
   * @returns 是否已找到帧
   */
  hasFrame(): boolean {
    return !!this.frame
  }

  /**
   * 等待帧解码完成
   * @param timeoutMs 超时时间（毫秒）
   * @returns 解码结果
   */
  async waitForFrame(timeoutMs: number): Promise<FrameData | undefined> {
    if (!this.videoDecoder || !this.demuxer) {
      this.logger.warn('waitForFrame: videoDecoder or demuxer is undefined')
      return undefined
    }
    const startTime = Date.now()
    this.logger.debug(`waitForFrame 开始, targetTime: ${this.targetTime}, timeoutMs: ${timeoutMs}, segmentUrl: ${this.segmentUrl}`)

    await this.autoReadChunk()

    this.videoDecoder.ondequeue = () => {
      this.autoReadChunk()
    }

    let loopCount = 0
    let lastAutoReadTime = Date.now()
    while (this.isRunning) {
      loopCount++
      const elapsed = Date.now() - startTime
      const timeout = this._checkTimeout(startTime, timeoutMs)

      // 如果解码器未配置，主动尝试读取数据（每100ms尝试一次）
      if (this.videoDecoder?.state === 'unconfigured' && Date.now() - lastAutoReadTime > 100) {
        this.logger.debug(`解码器未配置，主动尝试读取数据`)
        await this.autoReadChunk()
        lastAutoReadTime = Date.now()
      }

      if (this._shouldStop() || timeout) {
        if (timeout) {
          this.logger.error(`超时! 循环次数: ${loopCount}, 已耗时: ${elapsed}ms`)
          this.logger.error(`超时时的状态:`, {
            targetTime: this.targetTime,
            segmentUrl: this.segmentUrl,
            videoDecoderState: this.videoDecoder?.state,
            decodeQueueSize: this.videoDecoder?.decodeQueueSize,
            sampleQueueLength: this.sampleQueue.length,
            samplesProcessedLength: this.samplesProcessed.length,
            hasFrame: !!this.frame,
            readerIsDoned: this.reader?.isDoned,
            isRunning: this.isRunning,
            firstPts: this.firstPts,
          })
          this.logger.debug(this)
          this._stop()
          throw new Error(`DecoderFlow waitForFrame timeout, targetTime: ${this.targetTime}, segmentUrl: ${this.segmentUrl}`)
        }

        this._stop()

        if (this.frame) {
          const OFFSET = 1430000
          const frameTime = this._getFrameRealTime(
            /**
             * 减去 1430000 微秒，修正未知的时间偏差，该偏差来源于解复用层。
             * 使用 ffmpeg 查询流能得到准确的时间，但使用 ffprobe 查询流无法得到准确的时间。
             * 即使使用 firstPts 可以修正部分偏差，但也无法完全修正，
             * 因为 m3u8 文件的 #EXTINF 也存在误差，并且会累计放大误差。
             */
            this.frame.timestamp - OFFSET,
          )
          this.logger.debug(`成功找到帧, frameTime: ${frameTime}, 耗时: ${Date.now() - startTime}ms`)
          return {
            videoFrame: this.frame.clone(),
            frameTime,
            seekTime: this.targetTime,
            consumedTime: Date.now() - startTime,
          }
        }
      }

      await this._processSampleQueue()
    }

    return undefined
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this._stop()
    this.sampleQueue = []
    this.samplesProcessed = []

    if (this.frame) {
      this.frame.close()
      this.frame = undefined
    }

    if (this.demuxer) {
      this.demuxer.destroy()
      this.demuxer = undefined
    }

    if (this.videoDecoder && this.videoDecoder.state !== 'closed') {
      this.videoDecoder.close()
      this.videoDecoder = undefined
    }
  }

  /**
   * 销毁所有资源
   */
  destroy(): void {
    this.cleanup()
  }

  /**
   * 创建视频解码器
   * @returns 视频解码器
   */
  private _createDecoder(): VideoDecoder {
    const videoDecoder = new VideoDecoder({
      output: (videoFrame) => {
        this._processFrame(videoFrame)
      },
      error: (error) => {
        this.logger.error('解码器错误:', error.message, this.segmentUrl, {
          decoderState: this.videoDecoder?.state,
          sampleQueueLength: this.sampleQueue.length,
          samplesProcessedLength: this.samplesProcessed.length,
        })
        this._stop()
      },
    })
    return videoDecoder
  }

  /**
   * 创建解复用器
   * @returns 解复用器
   */
  private _createDemuxer(): DemuxerTsNew {
    this.logger.debug('_createDemuxer 创建解复用器')
    return new DemuxerTsNew({
      onConfig: (config) => {
        this.logger.debug(`_createDemuxer onConfig 回调, codec: ${config.codec}`)
        this._configure(config.codec)
      },
      onAvcFrameData: (encodeChunk) => {
        this._onAvcFrameData(encodeChunk)
      },
      onDone: () => {
        this.logger.debug('_createDemuxer onDone 回调, 刷新解码器')
        if (this.videoDecoder) {
          this.videoDecoder.flush()
        }
      },
    })
  }

  /**
   * 配置解码器
   * @param codec 编解码器字符串
   */
  private _configure(codec: string): void {
    if (!this.videoDecoder) {
      this.logger.warn('_configure videoDecoder is undefined')
      return
    }

    try {
      this.logger.debug(`_configure 配置解码器, codec: ${codec}`)
      this.videoDecoder.configure({
        codec,
      })
      this.logger.debug(`_configure 解码器配置成功, 状态: ${this.videoDecoder.state}`)
    }
    catch (error) {
      this.logger.error('_configure 配置解码器失败:', error, { codec })
    }
  }

  /**
   * 处理解复用后的 chunk
   */
  private _onAvcFrameData(encodeChunk: {
    avcFrame: AVCFrame
    rawData: Uint8Array
  }): void {
    const { avcFrame, rawData } = encodeChunk

    if (this._shouldStop()) {
      return
    }

    if (!avcFrame.pts) {
      this.logger.warn('_onDecodeChunk avcFrame lost pts')
      return
    }

    if (!avcFrame.duration) {
      this.logger.warn('_onDecodeChunk avcFrame lost duration')
      return
    }

    if (this.videoDecoder?.state === 'unconfigured') {
      this.logger.warn('_onDecodeChunk videoDecoder is unconfigured')
      return
    }

    if (!this.firstPts) {
      this.firstPts = avcFrame.pts
      if (!avcFrame.keyframe) {
        this.logger.warn('_onDecodeChunk first avcFrame is not keyframe')
      }
    }

    const encodedChunk = new EncodedVideoChunk({
      type: avcFrame.keyframe ? 'key' : 'delta',
      timestamp: timebaseConvert((avcFrame.pts), secTimebase, microsecTimebase),
      data: rawData,
    })

    this.sampleQueue.push(
      {
        encodedChunk,
        avcFrame,
        rawData,
      },
    )
  }

  /**
   * 处理解码出的帧
   * @param videoFrame 视频帧
   */
  private _processFrame(videoFrame: VideoFrame): void {
    const frameTime = this._getFrameRealTime(videoFrame.timestamp)
    const matchedFrame = this.matchFrame(videoFrame)

    if (!this.frame && matchedFrame) {
      this.frame = matchedFrame
      this.logger.debug(`_processFrame 找到匹配帧! frameTime: ${frameTime.toFixed(3)}s, targetTime: ${this.targetTime}s, timestamp: ${videoFrame.timestamp}`)
      return
    }

    videoFrame.close()
  }

  /**
   * 匹配第一个输出帧
   * @param videoFrame 视频帧
   * @returns 视频帧
   */
  private matchFirstFrameOutput(videoFrame: VideoFrame): VideoFrame | undefined {
    if (this.firstFramePriority && !this.frame) {
      return videoFrame
    }
    return undefined
  }

  /**
   * 精确匹配输出帧
   * @param videoFrame 视频帧
   * @returns 视频帧
   */
  private matchAccurateOutput(videoFrame: VideoFrame): VideoFrame | undefined {
    const frameTime = this._getFrameRealTime(videoFrame.timestamp)
    const OFFSET = 3
    const leftTime = frameTime - OFFSET
    const rightTime = frameTime + OFFSET
    const isMatch = leftTime <= this.targetTime && rightTime >= this.targetTime
    if (isMatch) {
      return videoFrame
    }
    return undefined
  }

  /**
   * 匹配帧时间
   * @param videoFrame 视频帧
   * @returns 是否匹配
   */
  private matchFrame(videoFrame: VideoFrame): VideoFrame | undefined {
    return this.matchFirstFrameOutput(videoFrame)
      || this.matchAccurateOutput(videoFrame)
  }

  /**
   * 自动读取分块
   */
  private async autoReadChunk() {
    const decodeQueueSize = this.videoDecoder?.decodeQueueSize ?? 0
    const shouldRead = (
      decodeQueueSize === 0
      && !this.frame
      && this.isRunning
      && this.reader
      && !this.reader.isDoned
    )

    if (shouldRead && this.reader) {
      try {
        this.logger.debug(`autoReadChunk 开始读取, decodeQueueSize: ${decodeQueueSize}`)
        const arrayBuffer = await this.reader.next()
        if (arrayBuffer) {
          this.logger.debug(`autoReadChunk 读取成功, 数据大小: ${arrayBuffer.byteLength} bytes`)
          this.pushData(arrayBuffer)
        }
        else {
          this.logger.warn(`autoReadChunk 读取返回 undefined, reader.isDoned: ${this.reader.isDoned}`)
        }
      }
      catch (error) {
        this.logger.error(`autoReadChunk 读取失败:`, error)
        throw error
      }
    }
    else {
      // 只在调试时记录，避免日志过多 - 但如果是未配置状态，需要详细记录
      if (this.videoDecoder?.state === 'unconfigured') {
        this.logger.warn(`autoReadChunk 跳过读取, 原因: decodeQueueSize=${decodeQueueSize}, hasFrame=${!!this.frame}, isRunning=${this.isRunning}, hasReader=${!!this.reader}, readerIsDoned=${this.reader?.isDoned}`)
      }
      else if (decodeQueueSize > 0) {
        // 正常情况，不记录日志避免过多
      }
      else if (this.frame) {
        // 正常情况，不记录日志避免过多
      }
      else if (!this.isRunning) {
        // 正常情况，不记录日志避免过多
      }
      else if (!this.reader) {
        this.logger.warn(`autoReadChunk 跳过读取, reader 未初始化`)
      }
      else if (this.reader.isDoned) {
        this.logger.debug(`autoReadChunk 跳过读取, reader 已完成`)
      }
    }
  }

  /**
   * 检查是否超时
   * @param startTime 开始时间
   * @param timeoutMs 超时时间（毫秒）
   * @returns 是否超时
   */
  private _checkTimeout(startTime: number, timeoutMs: number): boolean {
    return Date.now() - startTime > timeoutMs
  }

  /**
   * 判断是否应该停止
   * @returns 是否停止
   */
  private _shouldStop(): boolean {
    return !!this.frame || !this.isRunning
  }

  /**
   * 停止解码
   */
  private _stop(): void {
    this.isRunning = false
  }

  /**
   * 处理样本队列
   * @returns Promise<void>
   */
  private async _processSampleQueue(): Promise<void> {
    if (this.sampleQueue.length === 0) {
      await promiseDelay(0)
      return
    }

    const sample = this.sampleQueue.shift()
    if (sample && this.videoDecoder) {
      try {
        const pts = sample.avcFrame.pts
        const isKeyframe = sample.avcFrame.keyframe
        const timestamp = sample.encodedChunk.timestamp
        const frameTime = this._getFrameRealTime(timestamp)

        // 每10个样本记录一次，避免日志过多
        if (this.samplesProcessed.length % 10 === 0) {
          this.logger.debug(`_processSampleQueue 处理样本, 队列剩余: ${this.sampleQueue.length}, 已处理: ${this.samplesProcessed.length}, pts: ${pts}, isKeyframe: ${isKeyframe}, frameTime: ${frameTime.toFixed(3)}s, targetTime: ${this.targetTime}s`)
        }

        this.samplesProcessed.push(sample)
        this.videoDecoder.decode(sample.encodedChunk)
      }
      catch (error) {
        this.logger.error('解码失败:', error, {
          sample: {
            pts: sample.avcFrame.pts,
            keyframe: sample.avcFrame.keyframe,
            timestamp: sample.encodedChunk.timestamp,
          },
          decoderState: this.videoDecoder?.state,
        })
      }
    }
  }

  /**
   * 获取帧的实际时间
   * @param timestamp 时间戳 (微秒) 来源与 VideoFrame 或 EncodedVideoChunk
   * @returns 实际时间 (秒)
   */
  private _getFrameRealTime(timestamp: number): number {
    /** 转换时间基 */
    const videoFrameTime = timebaseConvert(
      timestamp,
      microsecTimebase,
      secTimebase,
    )
    /** 转换时间基 */
    const frameTime = videoFrameTime
    return frameTime
  }
}
