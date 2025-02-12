// MP4 URL 分块下载并流式写入 MediaSource 的实现

import { GM_xmlhttpRequest } from "$";
import { USER_AGENT_115 } from "../constants/useragent";

export const createMediaStreamFromChunks = async (mp4Url: string): Promise<MediaStream> => {
  const video = document.createElement('video');
  const mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';

  if (!MediaSource.isTypeSupported(mimeCodec)) {
    throw new Error('Unsupported MIME type or codec: ' + mimeCodec);
  }

  const mediaSource = new MediaSource();
  video.src = URL.createObjectURL(mediaSource);

  const sourceBuffer = await new Promise<SourceBuffer>((resolve) => {
    mediaSource.addEventListener('sourceopen', function sourceOpen() {
      console.log('MediaSource opened:', mediaSource.readyState);
      resolve(mediaSource.addSourceBuffer(mimeCodec));
    }, { once: true });
  });

  // 使用 Range 请求获取视频数据
  const fetchChunk = async (start: number, end: number) => {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url: mp4Url,
        headers: {
          'Range': `bytes=${start}-${end}`,
          'Cookie': document.cookie,
          'User-Agent': USER_AGENT_115
        },
        responseType: 'arraybuffer',
        onload: function(response) {
          if (response.status === 206) {
            resolve(response.response);
          } else {
            reject(new Error(`Unexpected status: ${response.status}`));
          }
        },
        onerror: reject
      });
    });
  };

  const appendBuffer = async (chunk: ArrayBuffer) => {
    return new Promise<void>((resolve, reject) => {
      if (mediaSource.readyState === 'open') {
        const handleUpdateEnd = () => {
          sourceBuffer.removeEventListener('updateend', handleUpdateEnd);
          resolve();
        };
        sourceBuffer.addEventListener('updateend', handleUpdateEnd);
        sourceBuffer.appendBuffer(new Uint8Array(chunk));
      } else {
        reject(new Error('MediaSource is not open'));
      }
    });
  };

  const CHUNK_SIZE = 1024 * 1024 * 5; // 5MB chunks
  let start = 0;

  try {
    while (start < 1024 * 1024 * 50 && mediaSource.readyState === 'open') {
      const chunk = await fetchChunk(start, start + CHUNK_SIZE - 1);
      if (!chunk || chunk.byteLength === 0) break;

      await appendBuffer(chunk);
      start += chunk.byteLength;
    }

    if (mediaSource.readyState === 'open') {
      mediaSource.endOfStream();
    }
  } catch (error) {
    console.error('Error during streaming:', error);
  }

  return video.captureStream();
};