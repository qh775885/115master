import { GM_getValue } from "$";
import GM_VALUE_KEY from "../constants/gm.value.key";
import DPlayer, { DPlayerOptions } from 'dplayer';
import drive115 from "../utils/download-url";
import Subtitlecat from "../utils/subtitlecat";
import { PlayingVideoInfo } from "../types/player";

class playerScript {
    private player: DPlayer | null = null;
    private playingVideoInfo: PlayingVideoInfo = GM_getValue(GM_VALUE_KEY.PLAYING_VIDEO_INFO) as PlayingVideoInfo;
    private subtitlecat: Subtitlecat = new Subtitlecat();

    constructor() {
        this.init();
    }

    async init() {
        this.clearDocument();
        await this.loadAllVideoSources();
        this.searchSubtitle();
    }

    private clearDocument() {
        const playingVideoInfo = GM_getValue(GM_VALUE_KEY.PLAYING_VIDEO_INFO);
        if (!playingVideoInfo?.title) {
            console.error('没有找到视频信息');
            return;
        }

        document.body.innerHTML = '<div id="dplayer"></div>';
        document.title = playingVideoInfo.title;

        const style = document.createElement('style');
        style.textContent = `
            body, html {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                background: #000;
            }
            
            #dplayer {
                width: 100vw;
                height: 100vh;
            }

            .subtitle-button {
                position: relative;
                cursor: pointer;
                padding: 8px;
                display: flex;
                align-items: center;
                height: 100%;
            }

            .subtitle-button svg {
                width: 22px;
                height: 22px;
                fill: #fff;
            }

            .dplayer-controller .subtitle-button {
                position: relative !important;
                padding: 0 10px;
                height: 100%;
                display: flex;
                align-items: center;
            }

            .dplayer-controller .subtitle-button svg {
                width: 22px;
                height: 22px;
                fill: #fff;
            }

            .dplayer-controller .subtitle-menu {
                display: none;
                position: absolute;
                bottom: 32px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                border-radius: 4px;
                padding: 8px 0;
                min-width: 150px;
                z-index: 1000;
            }

            .dplayer-controller .subtitle-button:hover .subtitle-menu,
            .dplayer-controller .subtitle-menu:hover {
                display: block !important;  /* 使用 !important 确保优先级 */
            }

            .subtitle-menu-item {
                color: #fff;
                padding: 6px 16px;
                cursor: pointer;
                white-space: nowrap;
            }

            .subtitle-menu-item:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            .subtitle-menu-item.active {
                color: #b7daff;
            }
        `;
        const hls = document.createElement('script');
        hls.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        document.head.appendChild(hls);
        document.head.appendChild(style);
        document.head.appendChild(hls);
    }

    private async loadAllVideoSources() {
        if (!this.playingVideoInfo.pickCode) {
            console.error('没有找到视频信息');
            return;
        }

        const { url: downloadUrl } = await drive115.getFileDownloadUrl(this.playingVideoInfo.pickCode);
        const m3u8RootUrl = drive115.getM3u8RootUrl(this.playingVideoInfo.pickCode);
        const m3u8List = await drive115.parseM3u8Url(m3u8RootUrl);

        const qualities = m3u8List.map(item => ({
            name: `${item.quality}p`,
            url: item.url,
            type: 'hls',
        }));

        // 添加极致原画
        qualities.unshift({
            name: 'Ultra原画',
            url: downloadUrl,
            type: 'auto',
        });

        this.createPlayer(qualities);
    }

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
            theme: '#b7daff',
            lang: 'zh-cn',
            hotkey: true,
            preload: 'auto',
            volume: 1,
            playbackSpeed: [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 5, 10],
        };

        this.player = new DPlayer(options);

        // 添加双击全屏事件
        const video = this.player.video;
        video.addEventListener('dblclick', () => {
            if (this.player) {
                if (document.fullscreenElement) {
                    this.player.fullScreen.cancel('browser');
                } else {
                    this.player.fullScreen.request('browser');
                }
            }
            return false
        });
    }

    private createSubtitleButton() {
        const controlBar = document.querySelector('.dplayer-controller');
        if (!controlBar) return;

        const button = document.createElement('div');
        button.className = 'dplayer-icon dplayer-quality-icon subtitle-button';
        button.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M20,4H4C2.9,4,2,4.9,2,6v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V6C22,4.9,21.1,4,20,4z M4,18V6h16v12H4z M6,10h2v2H6V10z M6,14h8v2H6V14z M16,14h2v2h-2V14z M10,10h8v2h-8V10z"/>
            </svg>
            <div class="subtitle-menu"></div>
        `;

        // 插入到设置按钮之前
        const settingButton = controlBar.querySelector('.dplayer-quality');
        if (settingButton) {
            settingButton.parentNode?.insertBefore(button, settingButton);
        }

        return button;
    }

    private updateSubtitleMenu(tracks: TextTrackList) {
        const menu = document.querySelector('.subtitle-menu');
        if (!menu) return;

        // 添加"关闭字幕"选项
        const menuItems = [`
            <div class="subtitle-menu-item" data-index="-1">
                关闭字幕
            </div>
        `];

        // 添加所有字幕选项
        for (let i = 0; i < tracks.length; i++) {
            const track = tracks[i];
            menuItems.push(`
                <div class="subtitle-menu-item ${track.mode === 'showing' ? 'active' : ''}" data-index="${i}">
                    ${track.label}
                </div>
            `);
        }

        menu.innerHTML = menuItems.join('');

        // 添加点击事件
        menu.querySelectorAll('.subtitle-menu-item').forEach((item: Element) => {
            item.addEventListener('click', (e) => {
                const index = parseInt((e.currentTarget as HTMLElement).dataset.index || '-1');
                this.switchSubtitle(tracks, index);
            });
        });
    }

    private switchSubtitle(tracks: TextTrackList, index: number) {
        for (let i = 0; i < tracks.length; i++) {
            tracks[i].mode = i === index ? 'showing' : 'hidden';
        }
        this.updateSubtitleMenu(tracks);
    }

    private async searchSubtitle() {
        if (!this.playingVideoInfo.avNumber) {
            console.error('没有找到番号');
            return;
        }

        const zhSubtitles = await this.subtitlecat.fetchSubtitle(this.playingVideoInfo.avNumber, 'zh-CN');
        
        if (this.player && zhSubtitles.length > 0) {
            const video = this.player.video as HTMLVideoElement;

            // 添加新的字幕轨道
            zhSubtitles.forEach((sub, index) => {
                const track = document.createElement('track');
                track.kind = 'subtitles';
                track.label = `【${sub.targetLanguage}】${sub.title}`;
                track.srclang = 'zh';
                track.src = sub.url;
                track.default = index === 0;
                video.appendChild(track);
            });

            // 创建字幕按钮和菜单
            this.createSubtitleButton();
            this.updateSubtitleMenu(video.textTracks);

            // 设置默认字幕
            if (video.textTracks.length > 0) {
                video.textTracks[0].mode = 'showing';
            }
        }
    }
}

export default playerScript;
