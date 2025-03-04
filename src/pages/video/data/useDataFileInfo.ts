import { useAsyncState } from "@vueuse/core";
import { reactive } from "vue";
import Drive115Instance from "../../../utils/drive115";
import type { WebApi } from "../../../utils/drive115/api";

export const useDataFileInfo = () => {
	const fileInfo = useAsyncState(
		async (pickCode: string) => {
			const response = await Drive115Instance.getFileInfo({
				pickcode: pickCode,
				share_id: "0",
				local: "1",
			});
			return response;
		},
		{} as WebApi.Res.FilesInfo,
		{
			immediate: false,
		},
	);

	return reactive(fileInfo);
};
