import { GM_getValue } from "$";
import GM_VALUE_KEY from "../constants/gm.value.key";
import DPlayer, { DPlayerOptions } from 'dplayer';
import drive115 from "../utils/download-url";
import { SubtitleCat } from "../utils/subtitlecat";
import { PlayingVideoInfo } from "../types/player";

class PlayerScript {
    private dp: DPlayer | null = null;
    private playingVideoInfo: PlayingVideoInfo;
    private subtitlecat: SubtitleCat;

    constructor() {
        this.playingVideoInfo = GM_getValue(GM_VALUE_KEY.PLAYING_VIDEO_INFO) as PlayingVideoInfo;
        this.subtitlecat = new SubtitleCat();
        this.init();
    }

    private async init() {
        if (!this.validateVideoInfo()) return;
        
        this.setupPlayerUI();
        await this.initializePlayer();
        await this.initializeSubtitles();
    }

    private validateVideoInfo(): boolean {
        if (!this.playingVideoInfo?.title) {
            console.error('没有找到视频信息');
            return false;
        }
        return true;
    }

    // UI 相关方法
    private setupPlayerUI() {
        this.clearDocument();
        this.injectStyles();
        this.injectHLSScript();
    }

    private clearDocument() {
        document.body.innerHTML = '<div id="dplayer"></div>';
        document.title = this.playingVideoInfo.title;
    }

    private injectStyles() {
        const style = document.createElement('style');
        style.textContent = this.getPlayerStyles();
        document.head.appendChild(style);
    }

    private injectHLSScript() {
        const hls = document.createElement('script');
        hls.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        document.head.appendChild(hls);
    }

    // 播放器初始化相关方法
    private async initializePlayer() {
        const qualities = await this.getVideoQualities();
        this.createPlayer(qualities);
        this.setupPlayerEvents();
    }

    private async getVideoQualities() {
        const { url: downloadUrl } = await drive115.getFileDownloadUrl(this.playingVideoInfo.pickCode);
        const m3u8RootUrl = drive115.getM3u8RootUrl(this.playingVideoInfo.pickCode);
        const m3u8List = await drive115.parseM3u8Url(m3u8RootUrl);

        const qualities = m3u8List.map(item => ({
            name: `${item.quality}p`,
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

        this.dp = new DPlayer(options);
    }

    private setupPlayerEvents() {
        if (!this.dp) return;
        
        this.dp.video.addEventListener('dblclick', () => {
            if (!this.dp) return;
            
            if (document.fullscreenElement) {
                this.dp.fullScreen.cancel('browser');
            } else {
                this.dp.fullScreen.request('browser');
            }
        });
    }

    // 字幕相关方法
    private async initializeSubtitles() {
        if (!this.playingVideoInfo.avNumber || !this.dp) return;

        this.dp.notice('🔍 正在搜索字幕...', 3000, 0.5);

        const subtitles = await this.subtitlecat.fetchSubtitle(
            this.playingVideoInfo.avNumber, 
            'zh-CN'
        );

        if (subtitles.length > 0) {
            this.addSubtitleTracks(subtitles);
            this.setupSubtitleControls();
        } else {
            this.dp.notice('🚫 未找到匹配的字幕', 3000, 0.8);
        }
    }

    private addSubtitleTracks(subtitles: any[]) {
        if (!this.dp) return;

        const video = this.dp.video as HTMLVideoElement;
        subtitles.forEach((sub, index) => {
            const track = document.createElement('track');
            track.kind = 'subtitles';
            track.label = `【${sub.targetLanguage}】${sub.title}`;
            track.srclang = 'zh';
            track.src = sub.url;
            track.default = index === 0;
            video.appendChild(track);
        });

        if (video.textTracks.length > 0) {
            video.textTracks[0].mode = 'showing';
            this.dp.notice(`✅ 字幕加载完成，共 ${video.textTracks.length} 条`, 2000, 0.8);
        }
    }

    private setupSubtitleControls() {
        if (!this.dp) return;
        
        const button = this.createSubtitleButton();
        if (button) {
            this.updateSubtitleMenu((this.dp.video as HTMLVideoElement).textTracks);
        }
    }

    private createSubtitleButton() {
        const controlBar = document.querySelector('.dplayer-controller');
        if (!controlBar) return null;

        const button = document.createElement('div');
        button.className = 'dplayer-icon dplayer-quality-icon subtitle-button';
        button.innerHTML = this.getSubtitleButtonHTML();

        const settingButton = controlBar.querySelector('.dplayer-quality');
        if (settingButton) {
            settingButton.parentNode?.insertBefore(button, settingButton);
        }

        return button;
    }

    private updateSubtitleMenu(tracks: TextTrackList) {
        const menu = document.querySelector('.subtitle-menu');
        if (!menu) return;

        menu.innerHTML = this.generateSubtitleMenuHTML(tracks);
        this.setupSubtitleMenuEvents(menu, tracks);
    }

    private setupSubtitleMenuEvents(menu: Element, tracks: TextTrackList) {
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
        this.dp!.notice(`✅ 已切换字幕: ${tracks[index].label}`, 2000, 0.8);
    }

    // HTML 模板方法
    private getPlayerStyles(): string {
        return `
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
                display: block !important;
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
    }

    private getSubtitleButtonHTML(): string {
        return `
            <svg viewBox="0 0 24 24">
                <path d="M20,4H4C2.9,4,2,4.9,2,6v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V6C22,4.9,21.1,4,20,4z M4,18V6h16v12H4z M6,10h2v2H6V10z M6,14h8v2H6V14z M16,14h2v2h-2V14z M10,10h8v2h-8V10z"/>
            </svg>
            <div class="subtitle-menu"></div>
        `;
    }

    private generateSubtitleMenuHTML(tracks: TextTrackList): string {
        const menuItems = [`
            <div class="subtitle-menu-item" data-index="-1">
                关闭字幕
            </div>
        `];

        for (let i = 0; i < tracks.length; i++) {
            const track = tracks[i];
            menuItems.push(`
                <div class="subtitle-menu-item ${track.mode === 'showing' ? 'active' : ''}" data-index="${i}">
                    ${track.label}
                </div>
            `);
        }

        return menuItems.join('');
    }
}

export default PlayerScript;
