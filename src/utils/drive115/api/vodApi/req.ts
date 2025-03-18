export type VodApiFilesReq = {
	pickcode: string;
	aid: number;
	cid: string;
	offset: number;
	limit: number;
	show_dir: number;
	nf: string;
	qid: number;
	type: number;
	source: string;
	format: string;
	star: string;
	is_q: string;
	is_share: string;
	r_all: number;
	o: string;
	asc: number;
	cur: number;
	natsort: number;
};

type VodApiFilesHistoryBase = {
	category: "1";
	share_id: string;
	pick_code: string;
};

export type VodApiGetFilesHistoryReq = VodApiFilesHistoryBase & {
	fetch: "one";
};

export type VodApiPostFilesHistoryReq = VodApiFilesHistoryBase & {
	op: "update";
	time: number;
	definition: "0";
};
