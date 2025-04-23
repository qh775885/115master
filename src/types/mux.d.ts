type InspectData = {
	type: "ftype" | "moov" | "moof" | "mdat";
};

declare module "mux.js" {
	export namespace mp4 {
		export namespace tools {
			export function inspect(data: Uint8Array): InspectData[];
		}
		export class Transmuxer {
			constructor(options?: {
				/**
				 * The Base Media Decode Time of the first segment to be passed into the transmuxer.
				 * @default 0
				 */
				baseMediaDecodeTime?: number;
				/**
				 * The default behavior of the MP4 Transmuxer is to rewrite the timestamps of media segments to ensure that they begin at 0 on the media timeline in MSE. To avoid this behavior, you may set this option to true.
				 * @default false
				 */
				keepOriginalTimestamps?: boolean;
				/**
				 * Set to true to remux audio and video into a single MP4 segment.
				 * @default true
				 */
				remux?: boolean;
			});
			on(event: "error", callback: (error: Error) => void): void;
			on(event: "done", callback: () => void): void;
			on(
				event: "data",
				callback: (data: {
					initSegment: Uint8Array;
					data: Uint8Array;
				}) => void,
			): void;
			push(data: Uint8Array): void;
			flush(): void;
		}
	}
}
