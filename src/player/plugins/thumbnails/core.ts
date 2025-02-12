type ThumbnailsOptions = {
    container: HTMLElement;
    barWidth: number;
    url: string;
    events: any;
}

export class ThumbnailsCore {
    container: HTMLElement;
    barWidth: number;
    url: string;
    events: any;

    constructor(options: ThumbnailsOptions) {
        this.container = options.container;
        this.barWidth = options.barWidth;
        this.url = options.url
        this.container.style.backgroundImage = `url('${options.url}')`;
        this.events = options.events;
    }

    resize(width: number, height: number, barWrapWidth: number) {
        this.container.style.width = `${width}px`;
        this.container.style.height = `${height}px`;
        this.container.style.top = `${-height + 2}px`;
        this.barWidth = barWrapWidth;
    }

    show() {
        this.container.style.display = 'block';
        this.events && this.events.trigger('thumbnails_show');
    }

    move(position: number) {
        this.container.style.backgroundPosition = `-${(Math.ceil((position / this.barWidth) * 100) - 1) * 160}px 0`;
        this.container.style.left = `${Math.min(Math.max(position - this.container.offsetWidth / 2, -10), this.barWidth - 150)}px`;
    }

    hide() {
        this.container.style.display = 'none';

        this.events && this.events.trigger('thumbnails_hide');
    }
}

