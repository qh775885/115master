export interface PlaylistItem {
    cid: string;
    // 文件名
    n: string;
    // pickcode
    pc: string;
    // 文件大小
    size: number;
    // 创建时间
    createTime: number;
    // 播放时长
    play_long: number;
}

export interface PathItem {
    cid: string,
    name: string,
    aid: string,
    pid: string,
    p_cid: string,
    isp: string,
    iss: string,
    fv: string,
    fvs: string
}