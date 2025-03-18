import { useThrottleFn } from "@vueuse/core";
import { type Ref, onUnmounted, shallowRef } from "vue";
import type XPlayerInstance from "../../../components/XPlayer/index.vue";
import drive115 from "../../../utils/drive115";

export const useDataHistory = (
	xplayerRef: Ref<InstanceType<typeof XPlayerInstance> | null>,
) => {
	const isinit = shallowRef(false);
	const pickcode = shallowRef("");

	const update = (time: number) => {
		if (!isinit.value || !pickcode.value) {
			return;
		}
		drive115.VodApiPostWebApiFilesHistory({
			op: "update",
			pick_code: pickcode.value,
			share_id: "0",
			category: "1",
			definition: "0",
			time,
		});
	};

	const updateThrottle = useThrottleFn((time: number) => {
		update(time);
	}, 3000);

	const handleUpdateCurrentTime = ({
		time,
		isManual,
	}: {
		time: number;
		isManual: boolean;
	}) => {
		if (isManual) {
			update(time);
		} else {
			updateThrottle(time);
		}
	};

	const fetch = async (_pickcode: string) => {
		pickcode.value = _pickcode;
		try {
			const res = await drive115.VodApiGetWebApiFilesHistory({
				fetch: "one",
				pick_code: pickcode.value,
				share_id: "0",
				category: "1",
			});
			if (!Number.isNaN(res.data.time)) {
				xplayerRef.value?.seekTo(res.data.time);
			}
		} finally {
			isinit.value = true;
		}
	};

	const clear = () => {
		pickcode.value = "";
		isinit.value = false;
	};

	onUnmounted(() => {
		isinit.value = false;
	});

	return {
		handleUpdateCurrentTime,
		fetch,
		clear,
	};
};
