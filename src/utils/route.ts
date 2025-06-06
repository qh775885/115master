import { GM_openInTab, GM_setValue } from "$";
import { NORMAL_HOST_155 } from "../constants/115";
import GM_VALUE_KEY from "../constants/gm.value.key";
import type { PlayingVideoInfo } from "../types/player";

export const goToPlayer = (
	playingVideoInfo: PlayingVideoInfo,
	isOpenInTab = false,
) => {
	GM_setValue(GM_VALUE_KEY.PLAYING_VIDEO_INFO, playingVideoInfo);
	const params = new URLSearchParams({
		cid: playingVideoInfo.cid || "",
		pick_code: playingVideoInfo.pickCode,
	});
	const url = `https://${NORMAL_HOST_155}/web/lixian/master/video/?${params.toString()}`;
	if (isOpenInTab) {
		GM_openInTab(url, {
			active: true,
		});
		return;
	}

	history.pushState({}, "", url);
};

/**
 * 是否是用户手动刷新页面
 */
export const isReload = (): boolean => {
	return (
		top?.window.performance.navigation.type ===
		top?.window.performance.navigation.TYPE_RELOAD
	);
};
