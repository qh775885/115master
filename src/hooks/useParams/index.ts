import { ref } from "vue";

/**
 * 视频页面参数
 */
export const useParamsVideoPage = () => {
	const pickCode = ref<string | null>();
	const avNumber = ref<string | null>();
	const cid = ref<string | null>();
	const title = ref<string | null>();

	const getParams = () => {
		const params = new URLSearchParams(window.location.search);
		pickCode.value = params.get("pick_code");
		avNumber.value = params.get("avNumber") || null;
		cid.value = params.get("cid");
		title.value = params.get("title");
	};

	getParams();

	return {
		pickCode,
		avNumber,
		cid,
		title,
		getParams,
	};
};
