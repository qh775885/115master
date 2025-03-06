<template>
    <img :src="src" :origin-src="props.src" :refferer="props.referer" v-bind="$attrs" />
</template>

<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue";
import { GMRequest } from "../../utils/request/gmRequst";
import type { RequestOptions } from "../../utils/request/types";

type Props = Partial<RequestOptions> & {
	referer?: string;
	src: string;
	alt: string;
};

const props = defineProps<Props>();

const gmRequst = new GMRequest();

const src = ref<string>();

const getImageByGmRequest = async (src: string) => {
	const res = await gmRequst.get(src, {
		headers: {
			Referer: props.referer,
		},
		responseType: "blob",
	});
	const blob = new Blob([res.data as BlobPart], { type: "image/jpeg" });
	const url = URL.createObjectURL(blob);
	return url;
};

const revokeUrl = (url?: string) => {
	if (url?.includes("blob://")) {
		URL.revokeObjectURL(url);
	}
};

watch(
	() => props.src,
	async (newVal) => {
		revokeUrl(src.value);
		if (newVal) {
			const result = await getImageByGmRequest(newVal);
			src.value = result;
		} else {
			src.value = "";
		}
	},
	{ immediate: true },
);

onUnmounted(() => {
	revokeUrl(src.value);
});
</script>

<style scoped>

</style>