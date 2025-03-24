// 获取文件信息请求
export type FilesInfoReq = {
	pickcode: string;
	share_id: string;
	local: string;
};

// 文件星标状态
export enum MarkStatus {
	Mark = "1",
	Unmark = "0",
}

// 文件星标请求
export type FilesStarReq = {
	file_id: string;
	star: MarkStatus;
};
