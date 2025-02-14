import { PlayingVideoInfo } from '../../../types/player';
import './playlist.css';
import { getAvNumber } from '../../../utils/getNumber';
import { iconOpenPlaylist, iconPrve, iconNext } from '../../icons/icons';
import { Entity } from '../../../utils/drive115';
import { PlayerPlugin } from '../index';
import { Player } from '../..';

interface State {
    playingVideoInfo?: PlayingVideoInfo;
    playlist: Entity.PlaylistItem[];
}

/**
 * 播放列表插件
 */
export class Playlist extends PlayerPlugin<State> {
    static pluginName = 'playlist';
    private prevButton?: HTMLElement;
    private nextButton?: HTMLElement;
    private changeVideoCallback: (playingVideoInfo: PlayingVideoInfo) => void = () => {};

    constructor(player: Player) {
        super(Playlist.pluginName, player, {
            playingVideoInfo: undefined,
            playlist: [],
        });
    }

    mount() {
        this.initList()
        this.initChahgePageButton()
        this.initOpenListButton()
    }

    destroy(): void {
    }

    onStateChange(): void {
        this.updateList(this.state.playlist);
        this.updateNavigationButtons();
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

        const rightIcons = this.player?.template.controller?.querySelector('.dplayer-icons-right');
        const firstChild = rightIcons?.firstChild;
        if (firstChild) {
            rightIcons?.insertBefore(button, firstChild);
        }
        button.addEventListener('click', this.onButtonClick.bind(this));

        // 除了点击button和播放列表，其他地方点击都关闭播放列表
        const handleDocumentClick = (e: MouseEvent) => {
            const target = e.target as Node;
            const list = this.player?.container.querySelector('.dplayer-playlist-list');

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
        const playButton = this.player?.template.controller?.querySelector('.dplayer-play-icon');
        
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
        list.innerHTML = this.renderList(this.state.playlist);

        // 阻止播放列表上的点击事件穿透
        list.addEventListener('mousedown', (e: MouseEvent) => {
            e.stopPropagation();
        });

        // 添加列表项点击事件
        list.addEventListener('click', this.onListItemClick.bind(this));

        this.player?.container.appendChild(list);
        this.updateList(this.state.playlist);
        this.updateNavigationButtons();
    }

    private renderList(playlistItems: Entity.PlaylistItem[]): string {
        return `
            ${playlistItems.map((item, index) => {
            const isPlaying = item.pc === this.state?.playingVideoInfo?.pickCode;
            return `
                    <div class="dplayer-playlist-list-item ${isPlaying ? 'playing' : ''}" 
                         data-index="${index}"
                    >
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

    private updateList(playlistItems: Entity.PlaylistItem[]) {
        const list = this.player?.container.querySelector('.dplayer-playlist-list');
        if (list) {
            list.innerHTML = this.renderList(playlistItems);
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
        const index = item.dataset.index as unknown as number;
        if (item) {
            const itemData = this.state.playlist[index];
            if (itemData.pc && itemData.pc !== this.state.playingVideoInfo?.pickCode) {
                this.onChangeIndex(index)
            }
        }
    }

    private onChangeIndex(index: number) {
        const itemData = this.state.playlist[index];
        const playingVideoInfo = {
            pickCode: itemData.pc,
            title: itemData.n,
            avNumber: getAvNumber(itemData.n || '') || undefined,
            cid: itemData.cid || '',
            size: itemData.size,
            createTime: itemData.createTime
        }
        this.changeVideoCallback(playingVideoInfo)
    }


    private updateNavigationButtons() {
        if (!this.state.playlist.length) return;

        const currentIndex = this.state.playlist.findIndex(item => item.pc === this.state.playingVideoInfo?.pickCode);
        
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
            if (currentIndex >= this.state.playlist.length - 1) {
                this.nextButton.classList.add('disabled');
            } else {
                this.nextButton.classList.remove('disabled');
            }
        }
    }

    private async onPrevClick() {
        if (!this.state.playlist.length) return;
        
        const currentIndex = this.state.playlist.findIndex(item => item.pc === this.state.playingVideoInfo?.pickCode);

        if (currentIndex > 0) {
            this.onChangeIndex(currentIndex - 1);
        }
    }

    private async onNextClick() {
        if (!this.state.playlist.length) return;
        
        const currentIndex = this.state.playlist.findIndex(item => item.pc === this.state.playingVideoInfo?.pickCode);
        
        if (currentIndex < this.state.playlist.length - 1) {
            this.onChangeIndex(currentIndex + 1);
        }
    }

    onChangeVideo(cb: (playingVideoInfo: PlayingVideoInfo) => void) {
        this.changeVideoCallback = cb;
    }
}