import { PlayerPlugin } from "..";
import { Player } from "../..";
import { getSegmentsWithDuration, m3u8Tumbnail } from "../../../utils/clip";
import './thumbnails.css';
import { throttle } from 'lodash';
import { calculateFitSize } from "./utils";

type TumbnailsState = {
    intervalSeconds?: number;
    samplesPerSegment?: number;
    maxWidth: number;
    maxHeight: number;
}

export class Tumbnails extends PlayerPlugin<TumbnailsState> {
    static pluginName = 'tumbnails';
    thumbnalCount = 0;
    private currentLoadingIndex: number = -1;
    private thumbnailCache: Map<number, string> = new Map();
    private videoUrl?: string;
    private segments?: { uri: string; duration: number }[];
    private totalDuration?: number;
    private throttledMove: (position: number) => void;
    private thumbnailWidth: number = 0;
    private thumbnailHeight: number = 0;
    constructor(player: Player) {
        super(player, {
            intervalSeconds: 60,
            samplesPerSegment: 10,
            maxWidth: 540,
            maxHeight: 304
        });

        this.throttledMove = throttle(this.handleMove.bind(this), 1000 / 12, {
            leading: true,
            trailing: true
        });
    }

    destroy(): void {
        this.thumbnailCache.clear();
        // @ts-ignoreg
        this.throttledMove.cancel();
        window.removeEventListener('resize', this.handleResize.bind(this));
    }

    async mount() {
        const options = this.player.options;
        const optionsVideo = options.video;
        if (!optionsVideo) {
            throw new Error('options video is not defined');
        }
        const optionsVideothumbnails = optionsVideo.thumbnails;
        if (!optionsVideothumbnails) {
            throw new Error('options video thumbnails is not defined');
        }

        const qualitys = optionsVideo.quality;
        if (!qualitys || qualitys.length === 0) {
            throw new Error('qualitys is not defined or qualitys is empty');
        }

        this.player.controller.thumbnails.move = this.move.bind(this);
        this.player.controller.thumbnails.resize = this.resize.bind(this);

        const url = qualitys[qualitys.length - 1].url;
        this.videoUrl = url;

        await this.initSegments(url);

        this.player.on('loadedmetadata', this.handleResize.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    onStateChange() {
        this.thumbnailWidth = 0;
        this.thumbnailHeight = 0;
        this.thumbnalCount = 0;
        this.thumbnailCache.clear();
        this.mount();
    }

    private handleResize() {
        const { width, height } = calculateFitSize(this.state.maxWidth, this.state.maxHeight, this.player.video.videoWidth, this.player.video.videoHeight)
        this.thumbnailWidth = width;
        this.thumbnailHeight = height;
        this.resize(this.thumbnailWidth, this.thumbnailHeight, this.player.template.barWrap.offsetWidth);
    }

    private async initSegments(url: string) {
        try {
            const { segments, totalDuration } = await getSegmentsWithDuration(url);
            this.segments = segments;
            this.totalDuration = totalDuration;
            this.thumbnalCount = segments.length;
        } catch (error) {
            console.error('Failed to init segments:', error);
        }
    }

    private getSegmentIndexByTime(time: number): number {
        if (!this.segments || !this.totalDuration) {
            return -1;
        }

        let accumulatedDuration = 0;
        for (let i = 0; i < this.segments.length; i++) {
            accumulatedDuration += this.segments[i].duration;
            if (accumulatedDuration >= time) {
                return i;
            }
        }
        return this.segments.length - 1;
    }

    private async loadThumbnailAtIndex(index: number, sampleIndex: number) {
        if (this.thumbnailCache.has(index) ||
            this.currentLoadingIndex === index ||
            !this.videoUrl ||
            !this.segments) {
            return;
        }

        this.currentLoadingIndex = index;
        try {
            const segment = this.segments[index];
            const thumbnail = await m3u8Tumbnail(
                this.videoUrl,
                this.state.samplesPerSegment,
                this.thumbnailWidth,
                segment.uri
            );

            if (thumbnail) {
                this.thumbnailCache.set(index, thumbnail.url);
                const thumbnailUrl = this.thumbnailCache.get(index);
                if (thumbnailUrl) {
                    this.player.controller.thumbnails.container.style.backgroundImage = `url('${thumbnailUrl}')`;
                    this.player.controller.thumbnails.container.style.backgroundPosition = `-${sampleIndex * this.thumbnailWidth}px 0`;
                }
            }
        } catch (error) {
            console.error('Failed to load thumbnail:', error);
        } finally {
            this.currentLoadingIndex = -1;
        }
    }


    resize(width: number, height: number, barWrapWidth: number) {
        const thumbnails = this.player.controller.thumbnails;
        thumbnails.container.style.width = `${width}px`;
        thumbnails.container.style.height = `${height}px`;
        thumbnails.container.style.top = `${-height + 2}px`;
        thumbnails.barWidth = barWrapWidth;
    }

    private handleMove(position: number) {
        const thumbnails = this.player.controller.thumbnails;

        if (!this.totalDuration) {
            return;
        }

        const currentTime = (position / thumbnails.barWidth) * this.totalDuration;
        const index = this.getSegmentIndexByTime(currentTime);

        if (index >= 0) {
            const segmentTime = this.getSegmentStartTime(index);
            const timeInSegment = currentTime - segmentTime;
            const segmentDuration = this.segments![index].duration;
            const sampleIndex = Math.floor((timeInSegment / segmentDuration) * this.state.samplesPerSegment!);
            const backgroundPosition = sampleIndex * this.thumbnailWidth;
            thumbnails.container.style.backgroundPosition = `-${backgroundPosition}px 0`;

            if (this.thumbnailCache.get(index)) {
                thumbnails.container.style.backgroundImage = `url('${this.thumbnailCache.get(index)}')`;
            } else {
                this.loadThumbnailAtIndex(index, sampleIndex);
            }
        }
    }

    move(position: number) {
        this.updateBoxPosition(position);
        this.throttledMove(position);
    }

    private updateBoxPosition(position: number) {
        const thumbnails = this.player.controller.thumbnails;
        const offset = 10;
        thumbnails.container.style.left = `${Math.min(
            Math.max(position - thumbnails.container.offsetWidth / 2, -offset),
            thumbnails.barWidth - (this.thumbnailWidth - offset)
        )}px`;
    }

    private getSegmentStartTime(index: number): number {
        if (!this.segments) {
            return 0;
        }
        let startTime = 0;
        for (let i = 0; i < index; i++) {
            startTime += this.segments[i].duration;
        }
        return startTime;
    }
}
