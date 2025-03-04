<template>
    <!-- 文件名 -->
    <div class="header-file" v-if="fileInfo.error">
        <div class="header-file-error">
            <span>❌ 获取文件信息失败</span>
        </div>
    </div>
    <div class="header-file" v-else-if="fileInfo.isLoading || (!fileInfo.isLoading && !fileInfo.isReady)">
        <Skeleton width="320px" height="28px" />
    </div>
    <div class="header-file" v-else>
        <span class="header-file-text">
            {{ fileInfo.state?.file_name?.toUpperCase() }}
            <span class="header-file-text-size">
                {{ formatFileSize(Number(fileInfo.state?.file_size)) }}
            </span>
        </span>
    </div>
</template>
<script setup lang="ts">
import Skeleton from "../../../../components/Skeleton/index.vue";
import { formatFileSize } from "../../../../utils/format";
import type { useDataFileInfo } from "../../data/useDataFileInfo";
const props = defineProps<{
	fileInfo: ReturnType<typeof useDataFileInfo>;
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