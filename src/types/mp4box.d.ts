// MP4 音频轨道类型定义
type MP4AudioTrack = {
	id: number;
	name: string;
	references: [];
	created: Date;
	modified: Date;
	movie_duration: number;
	movie_timescale: number;
	layer: number;
	alternate_group: number;
	volume: number;
	matrix: Int32Array;
	track_width: number;
	track_height: number;
	timescale: number;
	duration: number;
	samples_duration: number;
	codec: string;
	kind: {
		schemeURI: string;
		value: string;
	};
	language: string;
	nb_samples: number;
	size: number;
	bitrate: number;
	type: string;
	audio: {
		sample_rate: number;
		channel_count: number;
		sample_size: number;
	};
};

// MP4 视频轨道类型定义
type MP4VideoTrack = {
	id: number;
	name: string;
	references: [];
	created: Date;
	modified: Date;
	movie_duration: number;
	movie_timescale: number;
	layer: number;
	alternate_group: number;
	volume: number;
	matrix: Int32Array;
	track_width: number;
	track_height: number;
	timescale: number;
	duration: number;
	samples_duration: number;
	codec: string;
	kind: {
		schemeURI: string;
		value: string;
	};
	language: string;
	nb_samples: number;
	size: number;
	bitrate: number;
	type: string;
	video: {
		width: number;
		height: number;
	};
};
// MP4 文件信息类型定义
type MP4Info = {
	// 音频轨道
	audioTracks: MP4AudioTrack[];
	// 品牌
	brands: string[];
	// 视频轨道
	videoTracks: MP4VideoTrack[];
	// 创建时间
	created: Date;
	// 持续时间
	duration: number;
};

// MP4 样本类型定义
export type MP4Sample = {
	// 采样时间戳
	cts: number;
	// 解码时间戳
	dts: number;
	// 持续时间
	duration: number;
	// 是否同步
	is_sync: boolean;
	// 时间基
	timescale: number;
	// 数据
	data: Uint8Array;
	// 描述
	description: Uint8Array;
	// 描述偏移
	description_offset: number;
	// 描述长度
	description_length: number;
	// 编号
	number: number;
	// 轨道ID
	track_id: number;
	// 大小
	size: number;
};

// MP4 盒子解析器类型定义
type MP4BoxParser = {
	mvhd?: {
		timescale: number;
		duration: number;
	};
	uuid?: string;
	type: string;
	start: number;
	size: number;
	profile_compatibility: number;
	nb_SPS_nalus: number;
	nb_PPS_nalus: number;
	lengthSizeMinusOne: number;
	hdr_size: number;
	configurationVersion: number;
	AVCProfileIndication: number;
	AVCLevelIndication: number;
	PPS: {
		nalu: Uint8Array;
		length: number;
	}[];
	SPS: {
		nalu: Uint8Array;
		length: number;
	}[];
	write: (stream: DataStream) => void;
};

// MP4 轨道类型定义
type MP4Track = {
	mdia: {
		minf: {
			stbl: {
				stsd: {
					entries: {
						avcC?: MP4BoxParser;
						hvcC?: MP4BoxParser;
						vpcC?: MP4BoxParser;
						av1C?: MP4BoxParser;
					}[];
				};
			};
		};
	};
};

// MP4 流类型定义
type MP4BoxStream = {
	bufferIndex: number;
	buffers: ArrayBuffer[];
	position: number;
	buffer: ArrayBuffer;
	dataView: DataView;
	byteLength: number;
	byteOffset: number;
};

// MP4 文件类型定义
type MP4BoxFile = {
	// 盒子
	boxes: MP4BoxParser[];
	// 丢弃mdat数据
	discardMdatData: boolean;
	// 实体组
	entity_groups: unknown[];
	// 提取轨道
	extractedTracks: {
		id: number;
		nb_samples: number;
		samples: MP4Sample[];
		user?: unknown;
	}[];
	// 分片轨道
	fragmentedTracks: unknown[];
	ftyp: MP4BoxParser;
	// 是否初始化分片
	isFragmentationInitialized: boolean;
	// 是否渐进式
	isProgressive: boolean;
	// 是否构建列表
	itemListBuilt: boolean;
	// 列表
	items: unknown[];
	// 最后盒子开始位置
	lastBoxStartPosition: number;
	// 最后moof索引
	lastMoofIndex: number;
	// mdats
	mdats: MP4BoxParser[];
	// moofs
	moofs: MP4BoxParser[];
	// moov
	moov?: MP4BoxParser;
	// moov开始
	moovStartFound: boolean;
	// moov开始发送
	moovStartSent: boolean;
	// 下一个moof索引
	nextMoofNumber: number;
	// 下一个解析位置
	nextParsePosition: number;
	// 是否发送准备
	readySent: boolean;
	// 样本列表构建
	sampleListBuilt: boolean;
	// 样本处理开始
	sampleProcessingStarted: boolean;
	// sidx发送
	sidxSent: boolean;
	// 流
	stream: MP4BoxStream;
	// 设置提取选项
	setExtractionOptions: (
		id: number,
		type?: string,
		options?: {
			nbSamples?: number;
			rapAlignement?: boolean;
		},
	) => void;
	// 获取轨道
	getTrackById: (id: number) => MP4Track;
	// 开始
	start: () => void;
	// 停止
	stop: () => void;
	// 刷新
	flush: () => void;
	// 添加缓冲区
	appendBuffer: (buffer: ArrayBuffer) => void;
	// 准备
	onReady: (info: MP4Info) => void;
	// 采样
	onSamples: (trackId: number, _: unknown, samples: MP4Sample[]) => void;
	// 错误
	onError: (error: unknown) => void;
	// moov开始
	onMoovStart: () => void;
	// 分段
	onSegment: (
		id: number,
		user: unknown,
		buffer: Uint8Array,
		sampleNumber: number,
		last: boolean,
	) => void;
	// sidx
	onSidx: () => void;
};

declare module "mp4box" {
	export function createFile(): MP4BoxFile;
}
