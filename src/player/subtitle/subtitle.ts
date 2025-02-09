import type DPlayer from 'dplayer';
import { PlayingVideoInfo } from '../../types/player';
import { SubtitleCat } from '../../utils/subtitlecat';

export class Subtitle {
    private dp: DPlayer;
    private playingVideoInfo: PlayingVideoInfo;
    private subtitlecat: SubtitleCat;

    constructor(options: {
        dp: DPlayer,
        playingVideoInfo: PlayingVideoInfo
    }) {
        this.dp = options.dp;
        this.playingVideoInfo = options.playingVideoInfo;
        this.subtitlecat = new SubtitleCat();
        this.init();
    }

    // 初始化
    private init() {
        this.fetchSubtitle();
    }

    // 获取字幕
    private async fetchSubtitle() {
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

    // 添加字幕轨道
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

    // 设置字幕控制
    private setupSubtitleControls() {
        if (!this.dp) return;

        const button = this.createButton();
        if (button) {
            this.updateMenu((this.dp.video as HTMLVideoElement).textTracks);
        }
    }

    // 创建字幕控制按钮
    private createButton() {
        const controlBar = document.querySelector('.dplayer-controller');
        if (!controlBar) return null;

        const button = document.createElement('div');
        button.className = 'dplayer-icon dplayer-quality-icon subtitle-button';
        button.innerHTML = this.getButtonHTML();

        const settingButton = controlBar.querySelector('.dplayer-quality');
        if (settingButton) {
            settingButton.parentNode?.insertBefore(button, settingButton);
        }

        return button;
    }

    // 更新字幕菜单
    private updateMenu(tracks: TextTrackList) {
        const menu = document.querySelector('.subtitle-menu');
        if (!menu) return;

        menu.innerHTML = this.getMenuHTML(tracks);
        this.setupMenuEvents(menu, tracks);
    }

    // 设置字幕菜单事件
    private setupMenuEvents(menu: Element, tracks: TextTrackList) {
        menu.querySelectorAll('.subtitle-menu-item').forEach((item: Element) => {
            item.addEventListener('click', (e) => {
                const index = parseInt((e.currentTarget as HTMLElement).dataset.index || '-1');
                this.switchSubtitle(tracks, index);
            });
        });
    }

    // 切换字幕
    private switchSubtitle(tracks: TextTrackList, index: number) {
        for (let i = 0; i < tracks.length; i++) {
            tracks[i].mode = i === index ? 'showing' : 'hidden';
        }
        this.updateMenu(tracks);
        this.dp!.notice(`✅ 已切换字幕: ${tracks[index].label}`, 2000, 0.8);
    }

    // 获取字幕控制按钮HTML
    private getButtonHTML(): string {
        return `
            <svg viewBox="0 0 24 24">
                <path d="M20,4H4C2.9,4,2,4.9,2,6v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V6C22,4.9,21.1,4,20,4z M4,18V6h16v12H4z M6,10h2v2H6V10z M6,14h8v2H6V14z M16,14h2v2h-2V14z M10,10h8v2h-8V10z"/>
            </svg>
            <div class="subtitle-menu"></div>
        `;
    }

    // 获取字幕菜单HTML
    private getMenuHTML(tracks: TextTrackList): string {
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