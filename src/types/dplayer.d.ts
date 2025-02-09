import DPlayer from 'dplayer';

declare module 'dplayer' {
    export default interface DPlayer {
        qualityIndex: number;
        container: HTMLElement;
        template: {
            controller: HTMLElement;
        }
    }
}