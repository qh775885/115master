import { GM_info } from "$";

export const isMac = GM_info.userAgentData.platform.match(/mac/i);

export const is115Browser = navigator.userAgent.match(/115Browser/i);
