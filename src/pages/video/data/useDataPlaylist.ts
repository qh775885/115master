import { useAsyncState } from "@vueuse/core";
import { reactive } from "vue";
import drive115 from "../../../utils/drive115";

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

	return reactive(playlist);
};
