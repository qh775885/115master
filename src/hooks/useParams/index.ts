import { ref } from "vue";

/**
 * 视频页面参数
 */
export const useParamsVideoPage = () => {
	const pickCode = ref<string | null>();
	const cid = ref<string | null>();

	const getParams = () => {
		const params = new URLSearchParams(window.location.search);
		pickCode.value = params.get("pick_code");
		cid.value = params.get("cid");
	};

	getParams();

	return {
		pickCode,
		cid,
		getParams,
	};
};
