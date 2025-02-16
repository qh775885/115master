export interface VideoSource {
	name: string;
	url: string;
	type?: string;
	quality: number;
}

export interface PlayingVideoInfo {
	// 标题
	title: string;
	// 文件大小（字节）
	size: number;
	// 文件唯一标识
	pickCode: string;
	// 番号
	avNumber?: string;
	// 视频ID
	cid: string;
	// 创建时间戳
	createTime?: number;
}

export type M3u8Item = {
	name: string;
	url: string;
	quality: number;
};
