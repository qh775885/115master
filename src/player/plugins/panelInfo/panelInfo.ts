import { PlayingVideoInfo } from '../../../types/player';
import { iconClose, iconInfo } from '../../icons/icons';
import './panelInfo.css';
import { JavInfo } from '../../../utils/jav/jav';
import { JavInfoRenderer } from './javInfoRenderer';
import { BasicInfoRenderer } from './basicInfoRenderer';
import { Entity } from '../../../utils/drive115';
import { PlayerPlugin } from '..';
import { Player } from '../..';

interface State {
    playingVideoInfo?: PlayingVideoInfo;
    javInfos?: JavInfo[];
    filePath?: Entity.PathItem[];
}

/**
 * 信息面板插件
 */
export class PanelInfo extends PlayerPlugin<State> {
    static pluginName = 'panelInfo';
    private panel?: HTMLElement;
    private panelcloseButton?: HTMLElement;
    private content?: HTMLElement;
    private isOpen = false;
    private currentPaused = false;
    private javInfoRenderer: JavInfoRenderer | null = null;

    constructor(player: Player) {
        super(PanelInfo.pluginName, player, {
            playingVideoInfo: undefined,
            javInfos: [],
            filePath: [],
        });

        this.javInfoRenderer = new JavInfoRenderer(this.player);
        this.javInfoRenderer?.registerPreviewImages();
    }

    mount() {
        this.registerControlBarButton({
            className: 'dplayer-info-icon dplayer-icon',
            buttonHTML: iconInfo,
            onClick: () => {
                this.toggle();
            }
        })
        this.initPanel();
        this.onEvents();
    }

    destroy() {
        this.javInfoRenderer = null;
    }

    onStateChange() {
        this.renderPanelContent();
        this.javInfoRenderer?.registerPreviewImages();
    }

    private initPanel() {
        const panel = document.createElement('div');
        panel.className = 'dplayer-panel-info';
        this.panel = panel;

        // 添加关闭按钮
        const closeButton = document.createElement('div');
        closeButton.className = 'dplayer-panel-info-close';
        closeButton.innerHTML = iconClose;
        panel.appendChild(closeButton);
        this.panelcloseButton = closeButton;

        const content = document.createElement('div');
        content.className = 'dplayer-panel-info-content';
        this.content = content;

        panel.appendChild(content);
        this.player.container.appendChild(panel);
    }

    private renderPanelContent() {
        if (!this.content) {
            throw new Error('content is not initialized');
        };
        this.content.innerHTML = `
            <div class="dplayer-panel-content">
                ${BasicInfoRenderer.render(this.state.playingVideoInfo!, this.state.filePath || [])}
                ${this.state.javInfos?.length ? this.renderJavInfos(this.state.javInfos) : ''}
            </div>
        `;
    }

    private renderJavInfos(javInfos: JavInfo[]): string {
        return this.javInfoRenderer?.render(javInfos) || '';
    }

    private onEvents() {
        // 绑定视频容器点击事件
        this.player.template.videoWrap.addEventListener('click', this.handleVideoWrapClick.bind(this), true);
        // 绑定 panel tab 点击事件
        this.panel?.addEventListener('click', this.handleTabClick.bind(this));
        // 绑定关闭按钮点击事件
        this.panelcloseButton?.addEventListener('click', this.hide.bind(this));
    }

    private handleVideoWrapClick(e: MouseEvent) {
        if (!this.isOpen) return;

        e.stopImmediatePropagation();
        e.stopPropagation();

        const target = e.target as Node;

        // 判断点击是否在 panel 外部
        if (!this.panel?.contains(target)) {
            this.hide();
        }
    };

    private handleTabClick(e: MouseEvent) {
        const target = e.target as HTMLElement;
        if (target.classList.contains('dplayer-panel-tab-header')) {
            const tabName = target.dataset.tab;
            if (!tabName) return;

            // 更新 header active 状态
            this.panel?.querySelectorAll('.dplayer-panel-tab-header').forEach(header => {
                header.classList.toggle('active', header === target);
            });

            // 更新 content active 状态
            this.panel?.querySelectorAll('.dplayer-panel-tab-content').forEach(content => {
                content.classList.toggle('active',
                    (content as HTMLElement).dataset.tab === tabName);
            });
        }
    };

    private hide() {
        this.isOpen = false;
        this.panel?.classList.remove('active');
        if (!this.currentPaused) {
            this.player.video.play();
        }
    }

    private show() {
        this.isOpen = true;
        this.panel?.classList.add('active');
        this.currentPaused = this.player.video.paused;
        if (!this.currentPaused) {
            this.player.video.pause();
        }
    }

    private toggle() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.show();
        } else {
            this.hide();
        }
    }
}
