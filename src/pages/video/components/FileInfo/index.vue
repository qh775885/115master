<template>
    <!-- 文件名 -->
    <div class="header-file" v-if="fileInfo.isLoading.value">
        <Skeleton width="320px" height="28px" />
    </div>
    <div class="header-file" v-else-if="fileInfo.error.value">
        <div class="header-file-error">
            <span>❌ 获取文件信息失败</span>
        </div>
    </div>
    <div class="header-file" v-else>
        <span class="header-file-text">
            {{ fileInfo.state.value?.file_name?.toUpperCase() }}
            <span class="header-file-text-size">
                {{ formatFileSize(Number(fileInfo.state.value?.file_size)) }}
            </span>
        </span>
    </div>
</template>
<script setup lang="ts">
import type { UseAsyncStateReturn } from "@vueuse/core";
import Skeleton from "../../../../components/Skeleton/index.vue";
import type { WebApi } from "../../../../utils/drive115/api";
import { formatFileSize } from "../../../../utils/format";
const props = defineProps<{
	fileInfo: UseAsyncStateReturn<WebApi.Res.FilesInfo, [string], false>;
}>();
</script>

<style scoped>
.header-file {
	display: flex;
	gap: 8px;
	font-size: 20px;
    font-weight: bold;
}

.header-file-text {
	color: #f1f1f1;
}

.header-file-text-size {
	color: #999;
    font-size: 12px;
}
</style>