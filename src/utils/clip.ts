import MP4Box from "mp4box";
// @ts-ignore
import { DataStream } from "mp4box";
import { Parser } from 'm3u8-parser';
import Mux from 'mux.js';

type VideoTrack = any

// 从segments中提取指定间隔的片段
const extractSegmentsByInterval = (
  segments: { uri: string; duration: number }[],
  intervalSeconds: number = 60, // 默认每60秒提取一个片段
  maxSegments: number = 100 // 最大提取片段数
) => {
  const result: string[] = [];
  
  // 计算总时长
  const totalDuration = segments.reduce((sum, segment) => sum + segment.duration, 0);
  
  // 计算期望的片段数量
  let expectedSegments = Math.ceil(totalDuration / intervalSeconds);
  
  // 如果超过最大数量，调整为不超过最大值的最大整数倍
  if (expectedSegments > maxSegments) {
    // 计算每组片段数量（向上取整到最接近的整数）
    const segmentsPerGroup = Math.ceil(expectedSegments / maxSegments);
    // 计算实际组数
    const numberOfGroups = Math.floor(expectedSegments / segmentsPerGroup);
    // 调整期望的片段数量
    expectedSegments = numberOfGroups;
    // 重新计算间隔时间
    intervalSeconds = Math.ceil(totalDuration / expectedSegments);
    console.log(`Adjusted interval to ${intervalSeconds}s to get ${expectedSegments} segments`);
  }

  // 计算每个片段应该包含的原始片段数量
  const segmentsPerInterval = Math.ceil(segments.length / expectedSegments);
  
  // 按固定数量间隔选择片段
  for (let i = 0; i < segments.length; i += segmentsPerInterval) {
    result.push(segments[i].uri);
  }

  // 确保至少有一个片段
  if (result.length === 0 && segments.length > 0) {
    result.push(segments[0].uri);
  }
  
  return result;
};

// 使用 m3u8-parser 解析 m3u8 文件
const getSegments = async (m3u8url: string, intervalSeconds?: number) => {
  const response = await fetch(m3u8url);
  const m3u8Text = await response.text();

  const parser = new Parser();
  parser.push(m3u8Text);
  parser.end();

  const manifest = parser.manifest;
  console.log('manifest', manifest);

  if (intervalSeconds) {
    // 按间隔提取片段
    const extractedUris = extractSegmentsByInterval(manifest.segments, intervalSeconds);
    return extractedUris.map(uri => new URL(uri, m3u8url).href);
  }

  // 返回所有片段
  return manifest.segments.map(segment => {
    return new URL(segment.uri, m3u8url).href;
  });
};

type VideoFrame = {
  img: ImageBitmap;
  duration: number | null;
  timestamp: number;
}

interface ClipOptions {
  samplesPerSegment?: number; // 每个片段的采样数量
  intervalSeconds?: number;   // 片段间隔
  maxConcurrency?: number;    // 最大并发数
  specificSegment?: string;    // 新增：指定特定片段的 URL
}

export const m3u8Clip = (m3u8url: string, options: ClipOptions = {}): Promise<VideoFrame[]> => {
  const {
    samplesPerSegment = 1,
    intervalSeconds,
    maxConcurrency = 5,
    specificSegment
  } = options;

  return new Promise(async (resolve, reject) => {
    const segments = specificSegment ? [specificSegment] : await getSegments(m3u8url, intervalSeconds);
    console.log('segments', segments);

    // 处理单个片段
    const processSegment = async (segmentUrl: string): Promise<VideoFrame[]> => {
      const frames: VideoFrame[] = [];
      const mp4boxfile = MP4Box.createFile();
      
      return new Promise(async (resolve, reject) => {
        let videoDecoder: VideoDecoder | null = null;
        let videoTrack: VideoTrack | null = null;
        let countSample = 0;

        // @ts-ignore
        const transmuxer = new Mux.mp4.Transmuxer();

        transmuxer.on('data', (segment: any) => {
          const initSegment = new Uint8Array(segment.initSegment);
          const data = new Uint8Array(segment.data);
          
          const buffer = new ArrayBuffer(initSegment.byteLength + data.byteLength);
          const uint8View = new Uint8Array(buffer);
          uint8View.set(initSegment, 0);
          uint8View.set(data, initSegment.byteLength);
          
          // @ts-ignore
          buffer.fileStart = 0;
          mp4boxfile.appendBuffer(buffer);
        });

        mp4boxfile.onReady = (info: any) => {
          videoTrack = info.videoTracks[0];
          if (videoTrack) {
            mp4boxfile.setExtractionOptions(videoTrack.id, "video", {
              nbSamples: samplesPerSegment,
            });

            videoDecoder = new VideoDecoder({
              output: async (videoFrame) => {
                const img = await createImageBitmap(videoFrame);
                frames.push({
                  img,
                  duration: videoFrame.duration,
                  timestamp: videoFrame.timestamp,
                });
                videoFrame.close();
                countSample++;

                if (countSample >= samplesPerSegment) {
                  resolve(frames);
                }
              },
              error: (err) => {
                console.error("videoDecoder error:", err);
                reject(err);
              },
            });

            videoDecoder.configure({
              codec: videoTrack.codec,
              codedWidth: videoTrack.track_width,
              codedHeight: videoTrack.track_height,
              description: getExtradata(mp4boxfile) as Uint8Array,
            });

            mp4boxfile.start();
          }
        };

        mp4boxfile.onSamples = (trackId: any, ref: any, samples: any) => {
          if (videoTrack?.id === trackId) {
            mp4boxfile.stop();
            for (const sample of samples) {
              const chunk = new EncodedVideoChunk({
                type: sample.is_sync ? "key" : "delta",
                timestamp: sample.cts,
                duration: sample.duration,
                data: sample.data,
              });
              videoDecoder?.decode(chunk);
            }
          }
        };

        try {
          const response = await fetch(segmentUrl);
          const buffer = await response.arrayBuffer();
          transmuxer.push(new Uint8Array(buffer));
          transmuxer.flush();
          mp4boxfile.flush();
          // @ts-ignore
          await videoDecoder?.flush();
        } catch (error) {
          reject(error);
        }
      });
    };

    // 并发处理片段
    try {
      const processSegments = async (segments: string[]) => {
        const results = [];
        for (let i = 0; i < segments.length; i += maxConcurrency) {
          const batch = segments.slice(i, i + maxConcurrency);
          const batchResults = await Promise.all(
            batch.map(segment => processSegment(segment))
          );
          results.push(...batchResults.flat());
        }
        return results;
      };

      const frames = await processSegments(segments);
      resolve(frames);
    } catch (error) {
      console.error('Error processing m3u8:', error);
      reject(error);
    }
  });
};

/**
 * 获取 m3u8 的缩略图
 * @description 获取 m3u8 的缩略图，返回横向拼接的缩略图 BlobUrl
 * @param m3u8url m3u8 文件地址
 * @param samplesPerSegment 每个片段的采样数量
 * @param width 缩略图宽度
 * @param intervalSeconds 间隔秒数
 */
export const m3u8Tumbnail = async (
  m3u8url: string, 
  samplesPerSegment: number = 1,
  width: number = 160,
  segmentUrl?: string
): Promise<{
  url: string;  // 现在返回 base64 字符串而不是 blobUrl
  count: number;
} | undefined> => {
  try {
    const videoFrames = await m3u8Clip(m3u8url, { 
      samplesPerSegment,
      specificSegment: segmentUrl
    });

    if (!videoFrames.length) {
      console.warn('No video frames extracted');
      return;
    }

    // 保持原始宽高比
    const aspectRatio = videoFrames[0].img.width / videoFrames[0].img.height;
    const frameWidth = width;
    const frameHeight = frameWidth / aspectRatio;

    const canvas = document.createElement('canvas');
    canvas.width = frameWidth * videoFrames.length;
    canvas.height = frameHeight;
    const ctx = canvas.getContext('2d')!;

    let x = 0;
    for (const frame of videoFrames) {
      ctx.drawImage(frame.img, x, 0, frameWidth, frameHeight);
      x += frameWidth;
    }

    // 替换 blob 相关代码
    const base64Data = canvas.toDataURL('image/jpeg', 0.4);
    
    return {
      url: base64Data,
      count: videoFrames.length
    };
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    return undefined;
  }
};

// 辅助函数：获取解码器所需的额外数据
const getExtradata = (mp4box: any) => {
  try {
    const entry = mp4box.moov.traks[0].mdia.minf.stbl.stsd.entries[0];
    const box = entry.avcC ?? entry.hvcC ?? entry.vpcC;

    if (box != null) {
      // 创建一个足够大的 ArrayBuffer
      const buffer = new ArrayBuffer(1024);
      const stream = new DataStream(buffer, 0, DataStream.BIG_ENDIAN);
      box.write(stream);
      return new Uint8Array(stream.buffer, 8, stream.position - 8);
    }
  } catch (error) {
    console.error('Error in getExtradata:', error);
  }
  return null;
};

// 新增：获取带时长的分段信息
export const getSegmentsWithDuration = async (m3u8url: string) => {
    const response = await fetch(m3u8url);
    const m3u8Text = await response.text();

    const parser = new Parser();
    parser.push(m3u8Text);
    parser.end();

    const manifest = parser.manifest;
    const segments = manifest.segments.map(segment => ({
        uri: new URL(segment.uri, m3u8url).href,
        duration: segment.duration
    }));

    const totalDuration = segments.reduce((sum, segment) => sum + segment.duration, 0);

    return {
      manifest,
      segments,
      totalDuration
    };
};
