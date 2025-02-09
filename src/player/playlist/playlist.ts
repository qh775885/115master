import { PlayingVideoInfo } from '../../types/player';
import drive115, { PlaylistItem } from './../../utils/drive115';
import type DPlayer from 'dplayer';
import './playlist.css';
import { getAvNumber } from '../../utils/getNumber';
import { iconOpenPlaylist, iconPrve, iconNext } from '../icons/icons';

type ChangeVideoEvent = (playingVideoInfo: PlayingVideoInfo) => void;

export class Playlist {
    private dp: DPlayer;
    private playingVideoInfo: PlayingVideoInfo;
    private changeVideo: ChangeVideoEvent;
    private prevButton?: HTMLElement;
    private nextButton?: HTMLElement;
    private playlistItems: PlaylistItem[] = [];

    constructor(options: {
        dp: DPlayer,
        playingVideoInfo: PlayingVideoInfo
        changeVideo: ChangeVideoEvent
    }) {
        this.dp = options.dp;
        this.playingVideoInfo = options.playingVideoInfo;
        this.changeVideo = options.changeVideo;
        this.init();
    }

    private init() {
        this.initList();
        this.initOpenListButton();
        this.initChahgePageButton();
    }

    private initOpenListButton() {
        // 播放器右下角添加播放列表展开按钮
        const button = document.createElement('div');
        button.className = 'dplayer-icon dplayer-playlist-icon';
        button.innerHTML = iconOpenPlaylist;

        // 阻止按钮上的点击事件穿透
        button.addEventListener('mousedown', (e: MouseEvent) => {
            e.stopPropagation();
        });

        const rightIcons = this.dp?.template.controller?.querySelector('.dplayer-icons-right');
        const firstChild = rightIcons?.firstChild;
        if (firstChild) {
            rightIcons?.insertBefore(button, firstChild);
        }
        console.log('this.dp', this.dp);
        button.addEventListener('click', this.onButtonClick.bind(this));

        // 除了点击button和播放列表，其他地方点击都关闭播放列表
        const handleDocumentClick = (e: MouseEvent) => {
            const target = e.target as Node;
            const list = this.dp?.container.querySelector('.dplayer-playlist-list');

            // 如果点击的是播放列表或按钮，直接返回
            if (button.contains(target) || list?.contains(target)) {
                return;
            }

            // 如果播放列表是打开状态，则关闭它
            if (list?.classList.contains('active')) {
                list.classList.remove('active');
            }
        };

        document.addEventListener('mousedown', handleDocumentClick);
    }

    private initChahgePageButton() {
        // 添加上一集按钮
        const prevButton = document.createElement('div');
        prevButton.className = 'dplayer-icon dplayer-prev-icon';
        prevButton.innerHTML = iconPrve;
        this.prevButton = prevButton;
        
        // 添加下一集按钮
        const nextButton = document.createElement('div');
        nextButton.className = 'dplayer-icon dplayer-next-icon';
        nextButton.innerHTML = iconNext;
        this.nextButton = nextButton;

        // 阻止按钮上的点击事件穿透
        prevButton.addEventListener('mousedown', (e: MouseEvent) => e.stopPropagation());
        nextButton.addEventListener('mousedown', (e: MouseEvent) => e.stopPropagation());

        // 添加点击事件
        prevButton.addEventListener('click', this.onPrevClick.bind(this));
        nextButton.addEventListener('click', this.onNextClick.bind(this));

        // 获取播放按钮元素
        const playButton = this.dp?.template.controller?.querySelector('.dplayer-play-icon');
        
        if (playButton) {
            // 在播放按钮前插入上一集按钮
            playButton.parentNode?.insertBefore(prevButton, playButton);
            // 在播放按钮后插入下一集按钮
            playButton.parentNode?.insertBefore(nextButton, playButton.nextSibling);
        }

        // 初始化按钮状态
        this.updateNavigationButtons();
    }

    private initList() {
        const list = document.createElement('div');
        list.className = 'dplayer-playlist-list';
        list.innerHTML = this.getListHTML([]);

        // 阻止播放列表上的点击事件穿透
        list.addEventListener('mousedown', (e: MouseEvent) => {
            e.stopPropagation();
        });

        // 添加列表项点击事件
        list.addEventListener('click', this.onListItemClick.bind(this));

        this.dp?.container.appendChild(list);
        this.fetchPlaylist();
    }

    private getListHTML(playlistItems: PlaylistItem[]): string {
        return `
            ${playlistItems.map((item, index) => {
            const isPlaying = item.pc === this.playingVideoInfo.pickCode;
            return `
                    <div class="dplayer-playlist-list-item ${isPlaying ? 'playing' : ''}" 
                         data-index="${index}" 
                         data-pc="${item.pc}"
                         data-cid="${item.cid}"
                         data-n="${item.n}">
                         <div class="dplayer-playlist-list-item-index">
                            ${index + 1}
                         </div>
                        <div class="dplayer-playlist-list-item-title">
                        
                            ${item.n}
                        </div>
                    </div>
                `;
        }).join('')}
        `;
    }

    private async fetchPlaylist() {
        this.playlistItems = await drive115.getPlaylist(this.playingVideoInfo.cid, 0);
        console.log('playlistItems', this.playlistItems);
        this.updateList(this.playlistItems);
        this.updateNavigationButtons();
    }

    private updateList(playlistItems: PlaylistItem[]) {
        const list = this.dp?.container.querySelector('.dplayer-playlist-list');
        if (list) {
            list.innerHTML = this.getListHTML(playlistItems);
        }
    }

    private onButtonClick() {
        const list = document.querySelector('.dplayer-playlist-list')!;
        if (list) {
            if (list.classList.contains('active')) {
                list.classList.remove('active');
            } else {
                list.classList.add('active');
            }
        }

        setTimeout(() => {
            // 滚动到当前播放的视频
            const playingItem = list?.querySelector('.dplayer-playlist-list-item.playing');
            if (playingItem) {
                // 获取播放项相对列表顶部的偏移
                const itemOffsetTop = (playingItem as HTMLElement).offsetTop;
                // 计算目标滚动位置,使播放项居中显示
                const targetScrollTop = itemOffsetTop - (list.clientHeight - (playingItem as HTMLElement).offsetHeight) / 2;
                
                list.scrollTo({
                    top: targetScrollTop,
                    behavior: 'instant'
                });
            }
        }, 0)
    }

    private onListItemClick(e: MouseEvent) {
        const target = e.target as HTMLElement;
        const item = target.closest('.dplayer-playlist-list-item') as HTMLElement;
        if (item) {
            const dataset = item.dataset;
            if (dataset.pc && dataset.pc !== this.playingVideoInfo.pickCode) {
                const playingVideoInfo = {
                    pickCode: dataset.pc,
                    title: item.dataset.n || '',
                    avNumber: getAvNumber(item.dataset.n || '') || undefined,
                    cid: item.dataset.cid || ''
                }
                this.changeVideo(playingVideoInfo);
            }
        }
    }

    private updateNavigationButtons() {
        if (!this.playlistItems.length) return;

        const currentIndex = this.playlistItems.findIndex(item => item.pc === this.playingVideoInfo.pickCode);
        
        // 更新上一集按钮状态
        if (this.prevButton) {
            if (currentIndex <= 0) {
                this.prevButton.classList.add('disabled');
            } else {
                this.prevButton.classList.remove('disabled');
            }
        }

        // 更新下一集按钮状态
        if (this.nextButton) {
            if (currentIndex >= this.playlistItems.length - 1) {
                this.nextButton.classList.add('disabled');
            } else {
                this.nextButton.classList.remove('disabled');
            }
        }
    }

    private async onPrevClick() {
        if (!this.playlistItems.length) return;
        
        const currentIndex = this.playlistItems.findIndex(item => item.pc === this.playingVideoInfo.pickCode);
        
        if (currentIndex > 0) {
            const prevItem = this.playlistItems[currentIndex - 1];
            const playingVideoInfo = {
                pickCode: prevItem.pc,
                title: prevItem.n,
                avNumber: getAvNumber(prevItem.n) || undefined,
                cid: prevItem.cid
            };
            this.changeVideo(playingVideoInfo);
        }
    }

    private async onNextClick() {
        if (!this.playlistItems.length) return;
        
        const currentIndex = this.playlistItems.findIndex(item => item.pc === this.playingVideoInfo.pickCode);
        
        if (currentIndex < this.playlistItems.length - 1) {
            const nextItem = this.playlistItems[currentIndex + 1];
            const playingVideoInfo = {
                pickCode: nextItem.pc,
                title: nextItem.n,
                avNumber: getAvNumber(nextItem.n) || undefined,
                cid: nextItem.cid
            };
            this.changeVideo(playingVideoInfo);
        }
    }
}