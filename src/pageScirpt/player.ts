import { goToPlayer } from '../utils/route';
import { GM_getValue } from "$";
import GM_VALUE_KEY from "../constants/gm.value.key";
import { DPlayerOptions } from 'dplayer';
import DPlayer from 'dplayer';
import drive115 from "../utils/drive115";
import { PlayingVideoInfo } from "../types/player";
import { qualityNumMap } from "../constants/quality";
import { Playlist } from "../player/playlist/playlist";
import './player.css';
import { Subtitle } from "../player/subtitle/subtitle";

class PlayerScript {
    private dp: DPlayer | null = null;
    private playingVideoInfo: PlayingVideoInfo;

    constructor() {
        this.playingVideoInfo = GM_getValue(GM_VALUE_KEY.PLAYING_VIDEO_INFO) as PlayingVideoInfo;
        this.init();
    }

    private async init() {
        if (!this.validateVideoInfo()) return;

        this.setupPlayerUI();
        await this.initializePlayer();
        new Subtitle({
            dp: this.dp!,
            playingVideoInfo: this.playingVideoInfo
        });
        new Playlist({
            dp: this.dp!,
            playingVideoInfo: this.playingVideoInfo,
            changeVideo: this.changeVideo.bind(this)
        });
    }

    // 验证视频信息
    private validateVideoInfo(): boolean {
        if (!this.playingVideoInfo?.title) {
            console.error('没有找到视频信息');
            alert('没有找到视频信息');
            return false;
        }
        return true;
    }

    // UI 相关方法
    private setupPlayerUI() {
        this.clearDocument();
        this.injectFavicon();
        this.injectHLSScript();
    }

    // 清除文档
    private clearDocument() {
        document.body.innerHTML = '<div id="dplayer"></div>';
        document.title = `${this.playingVideoInfo.title}`;
        document.body.classList.add('player-body');
    }

    // 注入favicon
    private injectFavicon() {
        const link = document.createElement('link');
        link.id = 'favicon';
        link.rel = 'icon';
        link.href = 'https://115.com/favicon.ico';
        document.head.appendChild(link);
    }

    // 注入hls脚本
    private injectHLSScript() {
        // @ts-ignore
        if (window?.Hls) return;
        const hls = document.createElement('script');
        hls.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        document.head.appendChild(hls);
    }

    // 播放器初始化相关方法
    private async initializePlayer() {
        const qualities = await this.fetchVideos();
        this.createPlayer(qualities);
        this.setupPlayerEvents();
    }

    // 获取视频
    private async fetchVideos() {
        const { url: downloadUrl, fileToken } = await drive115.getFileDownloadUrl(this.playingVideoInfo.pickCode);
        const m3u8RootUrl = drive115.getM3u8RootUrl(this.playingVideoInfo.pickCode);
        const m3u8List = await drive115.parseM3u8Url(m3u8RootUrl);

        console.log('fileToken', fileToken);

        const qualities = m3u8List.map(item => ({
            name: qualityNumMap[item.quality as unknown as keyof typeof qualityNumMap],
            url: item.url,
            type: 'hls',
        }));

        qualities.unshift({
            name: 'Ultra原画',
            url: downloadUrl,
            type: 'auto',
        });

        return qualities;
    }

    // 创建播放器
    private createPlayer(qualities: any[]) {
        const options: DPlayerOptions = {
            container: document.getElementById('dplayer'),
            video: {
                url: qualities[0].url,
                type: qualities[0].type,
                quality: qualities,
                defaultQuality: 0,
            },
            autoplay: true,
            theme: '#0084ff',
            lang: 'zh-cn',
            hotkey: true,
            preload: 'auto',
            volume: 1,
            playbackSpeed: [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 5, 10],
        };

        this.dp = new DPlayer(options);
    }

    // 设置播放器事件
    private setupPlayerEvents() {
        if (!this.dp) return;

        // @ts-ignore
        this.dp.on('error', () => {
            this.dp?.switchQuality(this.dp.qualityIndex + 1);
        });

        this.dp.video.addEventListener('dblclick', () => {
            if (!this.dp) return;

            if (document.fullscreenElement) {
                this.dp.fullScreen.cancel('browser');
            } else {
                this.dp.fullScreen.request('browser');
            }
        });
    }

    // 切换视频
    private changeVideo(playingVideoInfo: PlayingVideoInfo) {
        console.log('切换视频', playingVideoInfo);
        this.playingVideoInfo = playingVideoInfo;
        goToPlayer(playingVideoInfo)
        this.init()
    }
}

export default PlayerScript;
