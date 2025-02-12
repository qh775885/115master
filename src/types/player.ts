export interface VideoSource {
    name: string;
    url: string;
    type?: string;
    quality: number;
}

export interface PlayingVideoInfo {
    title: string;
    size: number;     // 文件大小（字节）
    createTime: number; // 创建时间戳
    pickCode: string;
    avNumber?: string;
    cid: string;
}

export type M3u8Item = {
    name: string;
    url: string;
    quality: number;
}