import { useAsyncState } from "@vueuse/core";
import { computed } from "vue";
import { JavBus, JavDB } from "../../../utils/jav";
import { GMRequest } from "../../../utils/request/gmRequst";

export const useDataMovieInfo = () => {
	const javDB = new JavDB(new GMRequest());
	const javBus = new JavBus(new GMRequest());

	const javDBState = useAsyncState(
		async (avNumber?: string) => {
			if (!avNumber) {
				return null;
			}
			const res = await javDB.getInfoByAvNumber(avNumber);
			return res;
		},
		undefined,
		{
			immediate: false,
		},
	);

	const javBusState = useAsyncState(
		async (avNumber?: string) => {
			if (!avNumber) {
				return null;
			}
			return javBus.getInfoByAvNumber(avNumber);
		},
		undefined,
		{
			immediate: false,
		},
	);

	const movieInfo = computed(() => {
		return {
			javDBState,
			javBusState,
		};
	});

	return movieInfo;
};
