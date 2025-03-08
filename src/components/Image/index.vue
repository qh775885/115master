<template>
	<div class="image-container">
		<Skeleton width="100%" height="100%" :mode="skeletonMode" v-if="loading" />
		<LoadingError v-else-if="error" />
		<img v-else :src="src" :origin-src="props.src" :refferer="props.referer" v-bind="$attrs" />
	</div>
</template>

<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue";
import { GMRequest } from "../../utils/request/gmRequst";
import type { RequestOptions } from "../../utils/request/types";
import LoadingError from "../LoadingError/index.vue";
import Skeleton from "../Skeleton/index.vue";
type Props = Partial<RequestOptions> & {
	referer?: string;
	src: string;
	alt: string;
	skeletonMode?: "light" | "dark";
};

const props = defineProps<Props>();
const src = ref<string>();
const loading = ref(false);
const error = ref(false);
const gmRequst = new GMRequest();

const getImageByGmRequest = async (src: string) => {
	const res = await gmRequst.get(src, {
		headers: {
			...(props.referer ? { Referer: props.referer } : {}),
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

const loadImage = async (_src: string) => {
	try {
		loading.value = true;
		if (props.referer) {
			const result = await getImageByGmRequest(_src);
			src.value = result;
		} else {
			src.value = _src;
		}
	} catch {
		src.value = "";
		error.value = true;
	} finally {
		loading.value = false;
	}
};

watch(
	() => props.src,
	async (newVal) => {
		revokeUrl(src.value);
		if (newVal) {
			loadImage(newVal);
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
.image-container {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
}
</style>