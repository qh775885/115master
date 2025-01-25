import { GM_getValue } from "$";
import GM_VALUE_KEY from "../constants/gm.value.key";
import Player from 'xgplayer';
import TextTrack from 'xgplayer/es/plugins/track'
import drive115 from "../utils/download-url";
import 'xgplayer/dist/xgplayer.min.css'
import './player.css'
import Subtitlecat from "../utils/subtitlecat";
import { PlayingVideoInfo } from "../types/player";
class playerScript {
    private player: Player | null = null;
    private playingVideoInfo:PlayingVideoInfo = GM_getValue(GM_VALUE_KEY.PLAYING_VIDEO_INFO) as PlayingVideoInfo;
    private subtitlecat: Subtitlecat = new Subtitlecat();

    constructor() {
        console.log('Dplayer');
        this.init();
    }

    async init() {
        console.log('Dplayer init');
        this.clearDocument();
        await this.initPlayer();
    }

    async searchSubtitle() {
        console.log('searchSubtitle');
        const javNumber = this.playingVideoInfo.avNumber 
        if (!javNumber) {
            console.error('没有找到番号');
            return;
        }
        const result = await this.subtitlecat.fetchSubtitle(javNumber, 'zh-CN');
        console.log('subtitlecat result', result);
        this.player?.getPlugin('texttrack')?.updateSubtitles(result.map((item, index) => {
            return {
                id: index,
                url: item.url,
                stringContent: item.stringContent,
                language: item.targetLanguage.toLocaleLowerCase(),
                text: item.title,
                default: index === 0 ? true : false
            }
        }));
    }

    clearDocument() {
        const playingVideoInfo = GM_getValue(GM_VALUE_KEY.PLAYING_VIDEO_INFO);
        if (!playingVideoInfo?.title) {
            console.error('没有找到视频信息');
            return;
        }

        // 清空页面
        document.body.innerHTML = '';
        // 修改标题
        document.title = playingVideoInfo.title;
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            body, html {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
            }
            #xg-player {
                width: 100%;
                height: 100%;
            }
        `;
        document.head.appendChild(style);
    }

    private async initPlayer() {
        
        if (!this.playingVideoInfo.pickCode) {
            console.error('没有找到视频信息');
            return;
        }

        try {
            const { url, fileToken } = await drive115.getFileDownloadUrl(this.playingVideoInfo.pickCode);

            // 如果有 fileToken，添加到 cookie
            if (fileToken) {
                document.cookie = `${fileToken}; ${document.cookie}`;
            }

            // 创建 MediaSource URL
            this.createPlayer(url);
            this.searchSubtitle();
        } catch (error) {
            console.error('初始化播放器失败:', error);
        }
    }

    private createPlayer(url: string) {
        console.log('createPlayer', url);
        // 销毁旧的播放器实例
        if (this.player) {
            this.player.destroy();
            this.player = null;
        }

        // 创建播放器容器
        let container = document.getElementById('xg-player');
        if (!container) {
            container = document.createElement('div');
            container.id = 'xg-player';
            container.style.width = '100%';
            container.style.height = '100%';
            document.body.appendChild(container);
        }

        // 创建新的播放器实例
        this.player = new Player({
            id: 'xg-player',
            url: url,
            plugins: [TextTrack],
            playsinline: true,
            autoplay: true,
            fluid: true,
            height: window.innerHeight,
            width: window.innerWidth,
            volume: 1,
            playbackRate: [3, 2.5, 1.5, 1, 0.75, 0.5],
            keyShortcut: true,
            pip: true,
            cssFullscreen: true,
            download: true,
            keyboard: {
                seekStep: 10,
                disableGlobalKey: true
            },
            progress: {
                isDragingSeek: false
            },
            texttrack: {
                style: {
                    mode: 'bg',
                    followBottom: 100, // 跟随底部控制栏的高度
                }
            }
        });

        // 添加播放器事件监听
        this.player.on('ready', () => {
            console.log('播放器就绪');
        });

        this.player.on('error', (err) => {
            console.error('播放器错误:', err);
        });
    }
}

export default playerScript;
