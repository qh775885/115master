import { ref } from "vue";
import { setVideoCookie } from "..";
import type { VideoSource } from "../../../components/XPlayer";
import { qualityNumMap } from "../../../constants/quality";
import drive115 from "../../../utils/drive115";
export const useDataVideoSources = () => {
	const list = ref<VideoSource[]>([]);

	const fetch = async (pickCode: string) => {
		const [download, m3u8List] = await Promise.allSettled([
			drive115.getFileDownloadUrl(pickCode),
			drive115.getM3u8(pickCode),
		]);

		if (download.status === "fulfilled") {
			if (download.value.url.auth_cookie) {
				try {
					await setVideoCookie(download.value.url.auth_cookie);
				} catch (error) {
					alert("设置cookie失败");
					throw new Error("设置cookie失败");
				}
			}

			list.value.unshift({
				name: "Ultra原画",
				url: download.value.url.url,
				type: "auto",
				quality: 99999,
				displayQuality: "Ultra原画",
			});
		}

		if (m3u8List.status === "fulfilled") {
			list.value.push(
				...m3u8List.value.map((item) => ({
					name: `${item.quality}P`,
					url: item.url,
					type: "hls" as const,
					quality: item.quality,
					displayQuality:
						qualityNumMap[item.quality as keyof typeof qualityNumMap],
				})),
			);
		} else {
			console.log("m3u8", m3u8List.reason);
		}
	};

	const cleanup = () => {
		list.value = [];
	};

	return {
		list,
		fetch,
		cleanup,
	};
};
