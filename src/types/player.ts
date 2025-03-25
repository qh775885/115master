export interface PlayingVideoInfo {
	// 文件唯一标识
	pickCode: string;
	// 视频ID
	cid: string;
}

export type M3u8Item = {
	name: string;
	url: string;
	quality: number;
};
