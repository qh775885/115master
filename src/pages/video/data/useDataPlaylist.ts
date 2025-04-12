import { useAsyncState } from "@vueuse/core";
import { reactive } from "vue";
import { drive115 } from "../../../utils/drive115";

/**
 * 播放列表
 */
export const useDataPlaylist = () => {
	const playlist = useAsyncState(
		async (cid: string) => {
			const res = await drive115.getPlaylist(cid);
			return res;
		},
		[],
		{
			immediate: false,
		},
	);

	// 更新播放列表项时间
	const updateItemTime = (pickCode: string, time: number) => {
		const index = playlist.state.value.findIndex((i) => i.pc === pickCode);
		if (index !== -1) {
			playlist.state.value = playlist.state.value.map((i) => {
				if (i.pc === pickCode) {
					return { ...i, current_time: time };
				}
				return i;
			});
		}
	};

	// 更新播放列表项星标
	const updateItemMark = (pickCode: string, mark: boolean) => {
		const index = playlist.state.value.findIndex((i) => i.pc === pickCode);
		if (index !== -1) {
			playlist.state.value = playlist.state.value.map((i) => {
				if (i.pc === pickCode) {
					return { ...i, m: mark ? 1 : 0 };
				}
				return i;
			});
		}
	};

	return reactive({
		...playlist,
		updateItemTime,
		updateItemMark,
	});
};
