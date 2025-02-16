import DPlayer, {
	type DPlayerDanmaku,
	type DPlayerOptions,
	type DPlayerVideo,
} from "dplayer";
import type { PlayerPlugin } from "./plugins";

export class Player extends DPlayer {
	// ---- 重载类型 start ----
	template!: {
		barPreview: HTMLElement;
		barWrap: HTMLElement;
		videoWrap: HTMLElement;
		controller: HTMLElement;
		playedBarWrap: HTMLElement;
		playedBarTime: HTMLElement;
	};

	container!: HTMLElement;
	qualityIndex!: number;
	options!: DPlayerOptions;
	controller!: {
		thumbnails: {
			barWidth: number;
			container: HTMLElement;
			move: (position: number) => void;
			resize: (width: number, height: number, barWrapWidth: number) => void;
			hide: () => void;
		};
		initThumbnails: () => void;
		initPlayedBar: () => void;
		setAutoHide: () => void;
		hide: () => void;
		show: () => void;
		setAutoHideHandler: () => void;
	};
	switchVideo(video: DPlayerVideo, danmaku?: DPlayerDanmaku): void {
		(
			super.switchVideo as (
				video: DPlayerVideo,
				danmaku?: DPlayerDanmaku,
			) => void
		)(video, danmaku);
	}

	// biome-ignore lint/suspicious/noExplicitAny: <unknow>
	on(event: string, handler: (...args: any[]) => void): void {
		(
			super.on as (event: string, handler: (...args: unknown[]) => void) => void
		)(event, handler);
	}

	// ---- 重载类型 end ----

	static defaultOptions: Partial<DPlayerOptions> = {
		preventClickToggle: true,
		autoplay: true,
		theme: "#0084ff",
		lang: "zh-cn",
		hotkey: true,
		preload: "auto",
		volume: 1,
	};

	// biome-ignore lint/suspicious/noExplicitAny: <unknow>
	plugins: Record<string, PlayerPlugin<any>> = {};
	autoHideTimer: number | null | undefined;

	constructor(options: DPlayerOptions) {
		super({
			...Player.defaultOptions,
			...options,
		});

		this.setEvents();
	}

	setAutoHide() {
		this.controller.show();
		this.autoHideTimer && clearTimeout(this.autoHideTimer);
		this.autoHideTimer = setTimeout(() => {
			this.controller.hide();
		}, 500);
	}

	cancelAutoHide() {
		this.autoHideTimer && clearTimeout(this.autoHideTimer);
		this.autoHideTimer = null;
	}

	/**
	 * 注册插件
	 * @param PluginClass 插件类
	 */
	registerPlugin<State>(
		PluginClass: {
			new (player: Player, state?: State): PlayerPlugin<State>;
			pluginName: string;
		},
		state?: State,
	) {
		const plugin = new PluginClass(this, state);
		this.plugins[PluginClass.pluginName] = plugin;
	}

	/**
	 * 注销插件
	 * @param pluginName 插件名称
	 */
	unregisterPlugin(pluginName: string) {
		this.plugins[pluginName].destroy();
		delete this.plugins[pluginName];
	}

	/**
	 * 批量注销插件
	 * @param pluginNames 插件名称
	 */
	unregisterPlugins(pluginNames: string[]) {
		pluginNames.forEach((pluginName) => {
			this.unregisterPlugin(pluginName);
		});
	}

	/**
	 * 设置视频封面
	 * @param cover 封面图片地址
	 */
	setVideoCover(cover: string) {
		this.video.poster = cover;
	}

	/**
	 * 更新视频
	 * @param video 视频对象
	 */
	updateVideo(video: DPlayerVideo) {
		this.options.video = video;
		this.switchVideo(video);
	}

	/**
	 * 开始加载动画
	 */
	startLoadingAnimation() {
		this.container.classList.add("dplayer-loading");
	}

	/**
	 * 停止加载动画
	 */
	stopLoadingAnimation() {
		this.container.classList.remove("dplayer-loading");
	}

	/**
	 * 设置事件
	 */
	private setEvents() {
		this.template.videoWrap.addEventListener(
			"click",
			this.handleVideoWrapClick.bind(this),
		);
		this.template.videoWrap.addEventListener(
			"dblclick",
			this.handleVideoWrapDblClick.bind(this),
		);
		this.container.addEventListener("mousemove", this.setAutoHide.bind(this));
		document.addEventListener("keydown", this.handleKeyDown.bind(this), true);
		this.on("error", this.autoNextVideo.bind(this));
	}

	private handleKeyDown(e: KeyboardEvent) {
		if (e.key === "ArrowLeft") {
			e.stopImmediatePropagation();
			e.stopPropagation();
			this.seek(this.video.currentTime - 5);
		} else if (e.key === "ArrowRight") {
			e.stopImmediatePropagation();
			e.stopPropagation();
			this.seek(this.video.currentTime + 5);
		}
	}

	/**
	 * 自动切换视频
	 */
	private autoNextVideo() {
		this.switchQuality(this.qualityIndex + 1);
	}

	/**
	 * 处理单击事件
	 */
	private handleVideoWrapClick(e: MouseEvent) {
		e.stopPropagation();
		this.toggle();
	}

	/**
	 * 处理双击事件
	 */
	private handleVideoWrapDblClick(e: MouseEvent) {
		e.stopPropagation();
		if (document.fullscreenElement) {
			this.fullScreen.cancel("browser");
		} else {
			this.fullScreen.request("browser");
		}
	}
}
