import type { FrameData } from './DecoderFlow'
import { DecoderFlow } from './DecoderFlow'
import { HlsIO } from './io/HlsIO'

/** 超时时间 */
const TIMEOUT_MS = 5000

/**
 * M3U8 视频剪辑器构造选项
 */
interface M3U8ClipperOptions {
  /** m3u8 url */
  url: string
  /** 请求头 */
  headers?: Record<string, string>
  /** 请求选项 */
  fetchOptions?: RequestInit
}

/**
 * M3U8 视频剪辑器
 */
export class M3U8ClipperNew {
  hlsIo: HlsIO

  constructor(private options: M3U8ClipperOptions) {
    this.hlsIo = new HlsIO()
  }

  /**
   * 销毁
   */
  destroy() {
    this.hlsIo.destroy()
  }

  /**
   * 打开
   * @description 打开 m3u8 文件
   */
  async open(): Promise<void> {
    await this.hlsIo.open(this.options)
  }

  /**
   * 跳转
   * @description 跳转到分片截取 VideoFrame
   * @param time 时间/秒
   * @param firstFramePriority 首帧优先
   * @returns 视频帧
   */
  async seek(
    time: number,
    firstFramePriority = true,
  ): Promise<FrameData | undefined> {
    const segment = this.hlsIo.readSegment(time)
    const targetTime = time
    const decoderFlow = new DecoderFlow({
      targetTime,
      segmentUrl: segment.url,
      firstFramePriority,
      io: this.hlsIo,
    })

    decoderFlow.initialize()

    try {
      const frameData = await decoderFlow.waitForFrame(TIMEOUT_MS)
      if (frameData) {
        console.log('seek success frameData', frameData)
        return frameData
      }
      return undefined
    }
    catch (error) {
      console.error('seek error', error)
      throw error
    }
    finally {
      decoderFlow.destroy()
    }
  }
}
