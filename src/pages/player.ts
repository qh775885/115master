import drive115, { Entity } from "../utils/drive115/index";
import { PlayingVideoInfo } from "../types/player";
import { qualityNumMap } from "../constants/quality";
import './player.css';
import { Subtitle } from "../player/plugins/subtitle/subtitle";
import { PanelInfo } from '../player/plugins/panelInfo/panelInfo';
import { JavInfo } from '../utils/jav/jav';
import { JavBus } from '../utils/jav/javBus';
import { JavDB } from '../utils/jav/javDB';
import { ProcessedSubtitle, subtitlecat } from '../utils/subtitlecat';
import { GMRequestInstance } from '../utils/request/gmRequst';
import { Player } from '../player';
import { GM_getValue } from '$';
import GM_VALUE_KEY from '../constants/gm.value.key';
import { Playlist } from '../player/plugins/playlist/playlist';
import { goToPlayer } from "../utils/route";
import { Tumbnails } from "../player/plugins/thumbnails/thumbnails";
import { DPlayerOptions } from "dplayer";
import { imgTumnailsBlank } from "../player/images/imgBlank";

type VideoSources = {
    name: string;
    url: string;
    type: string;
}

class PlayerPage {

    /**
     * 状态
     */
    state: {
        playingVideoInfo: PlayingVideoInfo;
        subtitles: ProcessedSubtitle[];
        videoSources: VideoSources[];
        playlist: Entity.PlaylistItem[];
        filePath: Entity.PathItem[];
        javInfos: JavInfo[];
    } = {
            playingVideoInfo: {
                title: '',
                size: 0,
                createTime: 0,
                pickCode: '',
                cid: '',
                avNumber: '',
            },
            subtitles: [],
            videoSources: [],
            playlist: [],
            filePath: [],
            javInfos: [],
        }
    /**
     * 播放器
     */
    private player?: Player;

    /**
     * 元素
     */
    private elements: {
        playerContainer?: HTMLElement;
    } = {
            playerContainer: undefined,
        };

    constructor() {
        this.init();
    }

    /**
     * 初始化
     */
    private async init() {
        this.state.playingVideoInfo = GM_getValue(GM_VALUE_KEY.PLAYING_VIDEO_INFO) as PlayingVideoInfo;
        this.restDocument();
        this.injectFavicon();
        this.injectHLSScript();
        this.elements.playerContainer = document.getElementById('dplayer') as HTMLElement;

        const fetchVideoSourcesPromise = this.fetchVideoSources();

        await fetchVideoSourcesPromise;

        fetchVideoSourcesPromise.then(() => {
            const playerOptions: DPlayerOptions = {
                container: this.elements.playerContainer!,
                video: {
                    url: this.state.videoSources[0].url,
                    quality: this.state.videoSources,
                    defaultQuality: 0,
                    thumbnails: imgTumnailsBlank,
                },
            };

            this.player = new Player(playerOptions);
            this.player.registerPlugin(Subtitle);
            this.player.registerPlugin(Playlist);
            this.player.registerPlugin(PanelInfo);
            this.player.registerPlugin(Tumbnails, {
                intervalSeconds: 10,
                samplesPerSegment: 1,
                maxWidth: 540,
                maxHeight: 304
            });
        }).then(() => {
            const playlistPlugin = this.player!.plugins[Playlist.pluginName] as Playlist;
            const panelInfoPlugin = this.player!.plugins[PanelInfo.pluginName] as PanelInfo;
            const subtitlePlugin = this.player!.plugins[Subtitle.pluginName] as Subtitle;

            const fetchJavInfoPromise = this.fetchJavInfo();
            const fetchFilesInfoPromise = this.fetchFilesInfo();
            const fetchSubtitlePromise = this.fetchSubtitle();

            

            fetchSubtitlePromise.then(() => {
                subtitlePlugin.setState({
                    playingVideoInfo: this.state.playingVideoInfo,
                    subtitles: this.state.subtitles,
                    index: 0
                });
            })

            fetchFilesInfoPromise.then(() => {
                playlistPlugin.setState({
                    playingVideoInfo: this.state.playingVideoInfo,
                    playlist: this.state.playlist,
                });
                playlistPlugin.onChangeVideo(this.changeVideo.bind(this))

            })

            Promise.allSettled([fetchJavInfoPromise, fetchFilesInfoPromise]).then(() => {
                panelInfoPlugin.setState({
                    playingVideoInfo: this.state.playingVideoInfo,
                    javInfos: this.state.javInfos,
                    filePath: this.state.filePath,
                });
            })

            fetchJavInfoPromise.then(() => {
                this.player!.setVideoCover(this.state.javInfos[0]?.cover || '');
            })
        });
    }

    // 清除文档
    private restDocument() {
        document.body.innerHTML = '<div id="dplayer"></div>';
        document.title = `${this.state.playingVideoInfo.title}`;
        document.body.classList.add('player-body');
    }

    // 注入favicon
    private injectFavicon() {
        const link = document.createElement('link');
        link.id = 'favicon';
        link.rel = 'icon';
        link.href = 'https://115.com/favicon.ico';
        document.head.appendChild(link);
    }

    // 注入hls脚本
    private injectHLSScript() {
        // @ts-ignore
        if (window?.Hls) return;
        const hls = document.createElement('script');
        hls.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        document.head.appendChild(hls);

        // 注入dash脚本
        // @ts-ignore
        const dash = document.createElement('script');
        dash.src = 'https://cdn.jsdelivr.net/npm/dashjs@latest';
        document.head.appendChild(dash);
    }

    // 获取文件列表信息
    private async fetchFilesInfo() {
        const { data, path } = await drive115.getFiles(this.state.playingVideoInfo.cid, 0);
        this.state.playlist = data;
        this.state.filePath = path;
        console.log('playlist', this.state.playlist);
        console.log('filePath', this.state.filePath);
    }

    // 获取字幕
    private async fetchSubtitle() {
        if (!this.state.playingVideoInfo.avNumber) return;

        const subtitles = await subtitlecat.fetchSubtitle(
            this.state.playingVideoInfo.avNumber,
            'zh-CN'
        );
        this.state.subtitles = subtitles;
    }

    // 获取番号信息
    private async fetchJavInfo() {
        const JavClassList = [JavBus, JavDB];
        const PromiseList = JavClassList.map(JavClass => new JavClass(GMRequestInstance).getInfoByAvNumber(this.state.playingVideoInfo.avNumber!));
        const javInfos = await Promise.allSettled(PromiseList);
        this.state.javInfos = javInfos.map(i => i.status === 'fulfilled' ? i.value : undefined).filter(i => !!i);
        console.log('javInfos', this.state.javInfos);
    }

    // 获取视频
    private async fetchVideoSources() {

        this.state.videoSources = [];
        const [download, m3u8List] = await Promise.allSettled([
            drive115.getFileDownloadUrl(this.state.playingVideoInfo.pickCode),
            drive115.parseM3u8Url(drive115.getM3u8RootUrl(this.state.playingVideoInfo.pickCode)),
        ])



        if (download.status === 'fulfilled') {
            this.state.videoSources.unshift({
                name: 'Ultra原画',
                url: download.value.url,
                type: 'auto',
            });
        }

        if (m3u8List.status === 'fulfilled') {
            this.state.videoSources.push(...m3u8List.value.map(item => ({
                name: qualityNumMap[item.quality as unknown as keyof typeof qualityNumMap],
                url: item.url,
                type: 'hls',
            })));
        }
    }

    // 切换视频
    private changeVideo(playingVideoInfo: PlayingVideoInfo) {
        if (!this.player) {
            throw new Error('player is not initialized');
        };

        const playlistPlugin = this.player!.plugins[Playlist.pluginName] as Playlist;
        const panelInfoPlugin = this.player!.plugins[PanelInfo.pluginName] as PanelInfo;
        const subtitlePlugin = this.player!.plugins[Subtitle.pluginName] as Subtitle;

        this.state.playingVideoInfo = playingVideoInfo;

        playlistPlugin.setState({
            playingVideoInfo: this.state.playingVideoInfo,
            playlist: this.state.playlist,
        });

        panelInfoPlugin.setState({
            playingVideoInfo: this.state.playingVideoInfo,
            javInfos: [],
            filePath: [],
        });

        subtitlePlugin.setState({
            playingVideoInfo: this.state.playingVideoInfo,
            subtitles: [],
            index: 0,
        })

        this.player.pause();
        this.player.startLoadingAnimation();
        this.player.setVideoCover('');

        goToPlayer(playingVideoInfo)

        const fetchVideoSourcesPromise = this.fetchVideoSources();
        const fetchJavInfoPromise = this.fetchJavInfo();
        const fetchFilesInfoPromise = this.fetchFilesInfo();
        const fetchSubtitlePromise = this.fetchSubtitle();

        fetchVideoSourcesPromise.then(() => {
            if (!this.player) {
                throw new Error('player is not initialized');
            };

            this.player.stopLoadingAnimation();

            this.player.updateVideo({
                url: this.state.videoSources[0].url,
                quality: this.state.videoSources,
                type: 'auto',
                defaultQuality: 0,
                thumbnails: imgTumnailsBlank,
            })

            this.player.play();

        }).then(() => {

            this.player!.plugins[Tumbnails.pluginName]?.setState({
                intervalSeconds: 10,
                samplesPerSegment: 1,
                maxWidth: 540,
                maxHeight: 304
            })

            fetchSubtitlePromise.then(() => {
                subtitlePlugin.setState({
                    playingVideoInfo: this.state.playingVideoInfo,
                    subtitles: this.state.subtitles,
                    index: 0
                });
            })

            Promise.allSettled([fetchJavInfoPromise, fetchFilesInfoPromise]).then(() => {
                panelInfoPlugin.setState({
                    playingVideoInfo: this.state.playingVideoInfo,
                    javInfos: this.state.javInfos,
                    filePath: this.state.filePath,
                });
            })

            fetchJavInfoPromise.then(() => {
                this.player!.setVideoCover(this.state.javInfos[0]?.cover || '');
            })
        })
    }
}

export default PlayerPage;
