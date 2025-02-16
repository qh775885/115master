import { Parser } from "m3u8-parser";
import MP4Box from "mp4box";
// @ts-ignore
import { DataStream } from "mp4box";
import Mux from "mux.js";

// biome-ignore lint/suspicious/noExplicitAny: <unknow>
type VideoTrack = any;

export type VideoFrame = {
	img: ImageBitmap;
	duration: number | null;
	timestamp: number;
	t: number;
};

export class M3U8Clipper {
	// 处理单个片段
	private async processSegment({
		buffer,
		samplesPerSegment,
		width = 160,
		height = 90,
	}: {
		buffer: ArrayBuffer;
		samplesPerSegment: number;
		width?: number;
		height?: number;
	}): Promise<VideoFrame[]> {
		const frames: VideoFrame[] = [];
		const mp4boxfile = MP4Box.createFile();

		return new Promise((resolve, reject) => {
			let videoDecoder: VideoDecoder | null = null;
			let videoTrack: VideoTrack | null = null;
			let countSample = 0;

			// @ts-ignore
			const transmuxer = new Mux.mp4.Transmuxer();

			// biome-ignore lint/suspicious/noExplicitAny: <unknow>
			transmuxer.on("data", (segment: any) => {
				const initSegment = new Uint8Array(segment.initSegment);
				const data = new Uint8Array(segment.data);

				const buffer = new ArrayBuffer(
					initSegment.byteLength + data.byteLength,
				);
				const uint8View = new Uint8Array(buffer);
				uint8View.set(initSegment, 0);
				uint8View.set(data, initSegment.byteLength);

				// @ts-ignore
				buffer.fileStart = 0;
				mp4boxfile.appendBuffer(buffer);
			});

			// biome-ignore lint/suspicious/noExplicitAny: <unknow>
			mp4boxfile.onReady = (info: any) => {
				videoTrack = info.videoTracks[0];
				if (videoTrack) {
					mp4boxfile.setExtractionOptions(videoTrack.id, "video", {
						nbSamples: samplesPerSegment,
					});

					videoDecoder = new VideoDecoder({
						output: async (videoFrame) => {
							const img = await createImageBitmap(videoFrame, {
								resizeQuality: "pixelated",
								premultiplyAlpha: "none",
								resizeWidth: width,
								resizeHeight: height,
							});
							frames.push({
								img,
								duration: videoFrame.duration,
								timestamp: videoFrame.timestamp,
								t: 0,
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
						displayAspectHeight: height,
						displayAspectWidth: width,
						hardwareAcceleration: "prefer-hardware",
						optimizeForLatency: true,
						description: this.getExtradata(mp4boxfile) as Uint8Array,
					});

					mp4boxfile.start();
				}
			};

			// biome-ignore lint/suspicious/noExplicitAny: <unknow>
			mp4boxfile.onSamples = (trackId: any, _: any, samples: any) => {
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

				if (countSample === samplesPerSegment) {
					resolve(frames);
					videoDecoder?.flush();
				}
			};

			try {
				transmuxer.push(new Uint8Array(buffer));
				transmuxer.flush();
				mp4boxfile.flush();
				// @ts-ignore
				videoDecoder?.flush();
			} catch (error) {
				reject(error);
			}
		});
	}

	fetchBuffer(segmentUrl: string): Promise<ArrayBuffer> {
		return fetch(segmentUrl).then((response) => response.arrayBuffer());
	}

	// 生成缩略图
	public async createThumbnail({
		segmentUrl,
		segmentStartTime = 0,
		samplesPerSegment = 10,
		width = 160,
		height = 90,
	}: {
		segmentUrl: string;
		segmentStartTime: number;
		samplesPerSegment: number;
		width?: number;
		height?: number;
	}): Promise<
		| {
				videoFrames: VideoFrame[];
				count: number;
				times: {
					fetchBuffer: number;
					processSegment: number;
				};
		  }
		| undefined
	> {
		try {
			const startFetchBuffer = performance.now();
			const buffer = await this.fetchBuffer(segmentUrl);
			const endFetchBuffer = performance.now();

			const startProcessSegment = performance.now();
			const videoFrames = (
				await this.processSegment({
					buffer,
					samplesPerSegment,
					width,
					height,
				})
			).map((frame, index) => {
				return {
					...frame,
					t: segmentStartTime + index * frame.duration!,
				};
			});

			const endProcessSegment = performance.now();
			if (!videoFrames.length) {
				console.warn("No video frames extracted");
				return;
			}

			return {
				videoFrames: videoFrames,
				count: videoFrames.length,
				times: {
					fetchBuffer: endFetchBuffer - startFetchBuffer,
					processSegment: endProcessSegment - startProcessSegment,
				},
			};
		} catch (error) {
			console.error("Error creating thumbnail:", error);
			return undefined;
		}
	}

	// 获取带时长的分段信息
	public async getSegmentsWithDuration(m3u8url: string) {
		const response = await fetch(m3u8url);
		const m3u8Text = await response.text();

		const parser = new Parser();
		parser.push(m3u8Text);
		parser.end();

		const manifest = parser.manifest;
		const segments = manifest.segments.map((segment) => ({
			uri: new URL(segment.uri, m3u8url).href,
			duration: segment.duration,
		}));

		const totalDuration = segments.reduce(
			(sum, segment) => sum + segment.duration,
			0,
		);

		return {
			manifest,
			segments,
			totalDuration,
		};
	}

	// 辅助函数：获取解码器所需的额外数据
	// biome-ignore lint/suspicious/noExplicitAny: <unknow>
	private getExtradata(mp4box: any): Uint8Array | null {
		try {
			const entry = mp4box.moov.traks[0].mdia.minf.stbl.stsd.entries[0];
			const box = entry.avcC ?? entry.hvcC ?? entry.vpcC;

			if (box != null) {
				const buffer = new ArrayBuffer(1024);
				const stream = new DataStream(buffer, 0, DataStream.BIG_ENDIAN);
				box.write(stream);
				return new Uint8Array(stream.buffer, 8, stream.position - 8);
			}
		} catch (error) {
			console.error("Error in getExtradata:", error);
		}
		return null;
	}
}
