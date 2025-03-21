import { useEventListener } from "@vueuse/core";
import type { PlayerContext } from "./usePlayerProvide";

// 匹配热键
type HotKeyMatch = {
	key: string;
	config: HotKeyConfig;
};

// 热键配置
type HotKeyConfig = {
	keys: string[];
	name: string;
	keydown: (
		ctx: PlayerContext,
		event: KeyboardEvent,
		match: HotKeyMatch,
	) => void;
	keyup?: (
		ctx: PlayerContext,
		event: KeyboardEvent,
		match: HotKeyMatch,
	) => void;
};

// 修饰键
const MODIFIERS = {
	Shift: "Shift",
	Alt: "Alt",
	Control: "Control",
	Meta: "Meta",
};

// 按键
const KEYS = {
	sapce: " ",
	arrowLeft: "ArrowLeft",
	arrowRight: "ArrowRight",
	arrowUp: "ArrowUp",
	arrowDown: "ArrowDown",
	w: "w",
	a: "a",
	s: "s",
	d: "d",
	c: "c",
	f: "f",
	p: "p",
	m: "m",
	v: "v",
	W: "W",
	A: "A",
	S: "S",
	D: "D",
	C: "C",
	F: "F",
	P: "P",
	M: "M",
	V: "V",
	"0": "0",
	"1": "1",
	"2": "2",
	"3": "3",
	"4": "4",
	"5": "5",
	"6": "6",
	"7": "7",
	"8": "8",
	"9": "9",
	"-": "-",
	"=": "=",
	"[": "[",
	"]": "]",
	"\\": "\\",
	h: "h",
	j: "j",
	k: "k",
	l: "l",
	H: "H",
	J: "J",
	K: "K",
	L: "L",
	r: "r",
	R: "R",
};

const HOT_KEYS_CONFIG: Record<string, HotKeyConfig> = {
	progress: {
		keys: [
			KEYS["0"],
			KEYS["1"],
			KEYS["2"],
			KEYS["3"],
			KEYS["4"],
			KEYS["5"],
			KEYS["6"],
			KEYS["7"],
			KEYS["8"],
			KEYS["9"],
		],
		name: "进度",
		keydown: (ctx, event) => {
			const key = event.code;
			const digit = Number(key.replace("Digit", ""));
			ctx.progress?.skip(digit / 10, true);
		},
	},
	fastBackward: {
		keys: [KEYS.arrowLeft, KEYS.a, KEYS.A],
		name: "快退",
		keydown: (ctx) => {
			ctx.progress?.skip(-5);
		},
	},
	fastForward: {
		keys: [KEYS.arrowRight, KEYS.d, KEYS.D],
		name: "快进",
		keydown: (ctx, event) => {
			if (event.repeat) {
				ctx.playbackRate?.startLongPressFastForward();
			} else {
				ctx.progress?.skip(5);
			}
		},
		keyup: (ctx) => {
			if (ctx.playbackRate?.fastForward.value) {
				ctx.playbackRate?.stopLongPressFastForward();
			}
		},
	},
	playbackRateUp: {
		keys: [KEYS.arrowUp, KEYS.w, KEYS.W],
		name: "播放速度增大",
		keydown: (ctx) => {
			ctx.playbackRate?.up();
		},
	},
	playbackRateDown: {
		keys: [KEYS.arrowDown, KEYS.s, KEYS.S],
		name: "播放速度减小",
		keydown: (ctx, event) => {
			if (event.repeat) {
				ctx.playbackRate?.downWithLowerLimit();
			} else {
				ctx.playbackRate?.down();
			}
		},
	},
	volumeUp: {
		keys: [KEYS["="]],
		name: "音量增大",
		keydown: (ctx) => {
			ctx.volume?.adjustVolume(5);
		},
	},
	volumeDown: {
		keys: [KEYS["-"]],
		name: "音量减小",
		keydown: (ctx) => {
			ctx.volume?.adjustVolume(-5);
		},
	},
	togglePlay: {
		keys: [KEYS.sapce],
		name: "播放/暂停",
		keydown: (ctx) => {
			ctx.playing?.togglePlay();
		},
	},
	toggleMute: {
		keys: [KEYS.m],
		name: "切换静音",
		keydown: (ctx) => {
			ctx.volume?.toggleMute();
		},
	},
	toggleSubtitle: {
		keys: [KEYS.c, KEYS.C],
		name: "切换字幕",
		keydown: (ctx) => {
			if (ctx.subtitles?.loading.value || !ctx.subtitles?.ready.value) {
				return;
			}
			ctx.subtitles?.toggleEnabled();
		},
	},
	toggleFullscreen: {
		keys: [KEYS.f, KEYS.F],
		name: "切换全屏",
		keydown: (ctx) => {
			ctx.fullscreen?.toggleFullscreen();
		},
	},
	toggleTheaterMode: {
		keys: [KEYS.v, KEYS.V],
		name: "切换剧院模式",
		keydown: (ctx) => {
			ctx.fullscreen?.toggleTheatre();
		},
	},
	togglePictureInPicture: {
		keys: [KEYS.p, KEYS.P],
		name: "切换画中画",
		keydown: (ctx) => {
			ctx.pictureInPicture?.toggle();
		},
	},
	rotateLeft: {
		keys: [KEYS["["], KEYS.l, KEYS.L],
		name: "向左旋转",
		keydown: (ctx) => {
			ctx.transform?.left();
		},
	},
	rotateRight: {
		keys: [KEYS["]"], KEYS.r, KEYS.R],
		name: "向右旋转",
		keydown: (ctx) => {
			ctx.transform?.right();
		},
	},
	resetRotation: {
		keys: [KEYS["\\"]],
		name: "重置旋转",
		keydown: (ctx) => {
			ctx.transform?.normal();
		},
	},
	toggleFlipX: {
		keys: [KEYS.h, KEYS.H],
		name: "水平翻转",
		keydown: (ctx) => {
			ctx.transform?.toggleFlipX();
		},
	},
	toggleFlipY: {
		keys: [KEYS.j, KEYS.J],
		name: "垂直翻转",
		keydown: (ctx) => {
			ctx.transform?.toggleFlipY();
		},
	},
};

/**
 * 解析按键组
 * @param key 按键组
 * @returns 按键组 Set<string>
 */
const parseKeyConfig = (key: string) => {
	return new Set(key.split("+").filter((item) => item !== ""));
};

const preseKeyEvent = (event: KeyboardEvent) => {
	const modifiers = [
		event.altKey ? MODIFIERS.Alt : null,
		event.shiftKey ? MODIFIERS.Shift : null,
		event.ctrlKey ? MODIFIERS.Control : null,
		event.metaKey ? MODIFIERS.Meta : null,
	].filter((item) => !!item) as string[];
	return new Set([...modifiers, event.key]);
};

// 判断事件的修饰键是否与配置键的修饰键相同
const isSame = (eventSet: Set<string>, configSet: Set<string>) => {
	return (
		eventSet.size === configSet.size &&
		Array.from(configSet).every((key) => eventSet.has(key))
	);
};

// 匹配按键
const matchKey = (event: KeyboardEvent) => {
	const eventSet = preseKeyEvent(event);
	for (const config of Object.values(HOT_KEYS_CONFIG)) {
		for (const key of config.keys) {
			const configSet = parseKeyConfig(key);
			if (isSame(eventSet, configSet)) {
				return { key, config };
			}
		}
	}
	return null;
};

/**
 * 使用热键
 * @param ctx 播放器上下文
 */
export function useHotKey(ctx: PlayerContext) {
	// 按键按下
	const handleKeydown = (event: KeyboardEvent) => {
		// 忽略输入框的按键事件
		if (
			event.target instanceof HTMLInputElement ||
			event.target instanceof HTMLTextAreaElement
		) {
			return;
		}

		const match = matchKey(event);
		if (match?.key) {
			event.preventDefault();
			match.config.keydown(ctx, event, match);
		}
	};

	// 按键抬起
	const handleKeyup = (event: KeyboardEvent) => {
		const match = matchKey(event);
		if (match?.key) {
			event.preventDefault();
			match.config.keyup?.(ctx, event, match);
		}
	};

	useEventListener("keydown", handleKeydown);
	useEventListener("keyup", handleKeyup);
}
