import { GM_openInTab, GM_setValue } from '$';
import GM_VALUE_KEY from '../constants/gm.value.key';
import { getAvNumber } from '../utils/getNumber';
import { PlayingVideoInfo } from '../types/player';

class HomeScript {

    constructor() {
        console.log('Home');
        this.init()
    }


    init() {
        console.log('Home init');
        this.addFileListItemHouverMenu()
    }


    addFileListItemHouverMenu() {
        document.addEventListener('mouseover', (event) => {
            const target = event.target as HTMLElement;
            const listItem = target.closest('li[file_type="1"]');
            if (!listItem || !this.isValidFileListItem(listItem as HTMLElement)) return;

            if (listItem.getAttribute('paly_button') === '1') return;
            listItem.setAttribute('paly_button', '1');
            console.log(listItem);

            const buttons = [
                {
                    class: 'master-player',
                    title: '使用Master播放视频',
                    text: '🚀 Master播放'
                }
            ];

            const fileOpr = listItem.querySelector('.file-opr');
            if (!fileOpr) return;

            buttons.forEach(button => {
                const link = document.createElement('a');
                link.href = 'javascript:void(0)';
                link.className = button.class;
                link.title = button.title;
                link.style.cssText = 'pointer-events: all; position: relative; z-index: 1000;';
                const span = document.createElement('span');
                span.textContent = button.text;
                span.style.pointerEvents = 'none';
                link.appendChild(span);
                fileOpr.prepend(link);

                link.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    
                    const playingVideoInfo: PlayingVideoInfo = {
                        pickCode: listItem.getAttribute('pick_code')!,
                        title: listItem.getAttribute('title')!,
                        avNumber: getAvNumber(listItem.getAttribute('title')!),
                        url: listItem.getAttribute('url')!,
                        fileToken: listItem.getAttribute('file_token')!
                    }

                    console.log('即将播放', playingVideoInfo);
                    GM_setValue(GM_VALUE_KEY.PLAYING_VIDEO_INFO, playingVideoInfo)
                    const url = `https://115.com/web/lixian/?pick_code=${playingVideoInfo.pickCode}&avNumber=${playingVideoInfo.avNumber}&title=${playingVideoInfo.title}`
                    GM_openInTab(url, {
                        active: true
                    });
                });
            });
        });
    }

    private isValidFileListItem(element: HTMLElement): boolean {
        return element.matches('li[file_type="1"]:has(.duration):not([file_mode="4"],[paly_button="1"])');
    }
}

export default HomeScript;
