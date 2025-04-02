import Hls from "hls.js";
import { type Ref, shallowRef } from "vue";

interface HLSConfig {
	autoStartLoad?: boolean;
	startPosition?: number;
	debug?: boolean;
	[key: string]: unknown;
}

export function useHls(videoElement: Ref<HTMLVideoElement | null>) {
	const instance = shallowRef<Hls | null>(null);
	const isSupported = Hls.isSupported();

	const initHls = (url: string, config: HLSConfig = {}) => {
		if (!isSupported) {
			console.warn("HLS is not supported in this browser");
			return false;
		}
		if (!videoElement.value) {
			console.warn("videoElement is null");
			return false;
		}

		instance.value = new Hls({
			autoStartLoad: true,
			maxBufferLength: 1200,
			lowLatencyMode: true,
			startPosition: -1,
			debug: false,
			...config,
		});

		instance.value.loadSource(url);
		instance.value.attachMedia(videoElement.value);
		return true;
	};

	const destroy = () => {
		if (instance.value) {
			instance.value.destroy();
			instance.value = null;
		}
	};

	return {
		instance,
		isSupported,
		initHls,
		destroy,
	};
}
