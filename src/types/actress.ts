export type ActressImageInfo = {
	Content: Record<string, Record<string, string>>;
	Information: {
		TotalNum: number;
		TotalSize: number;
		Timestamp: number;
	};
};

export type ActressImageMap = Map<
	string,
	{
		folder: string;
		filename: string;
		timestamp: number;
	}
>;
