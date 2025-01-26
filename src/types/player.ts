export interface VideoSource {
    name: string;
    url: string;
    type?: string;
    quality: number;
}

export interface PlayingVideoInfo {
    title: string;
    pickCode: string;
    avNumber?: string;
}

export type M3u8Item = {
    name: string;
    url: string;
    quality: number;
}