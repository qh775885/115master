import { useStorage } from "@vueuse/core";

export const usePreferences = () => {
	const preferences = useStorage("x-player-preferences", {
		volume: 100,
		muted: true,
		playbackRate: 1,
		showSider: false,
		autoLoadThumbnails: true,
		superAutoBuffer: false,
		disabledHDR: false,
	});

	return preferences;
};
