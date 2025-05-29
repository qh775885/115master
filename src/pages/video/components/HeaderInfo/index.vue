<template>
    <div v-if="fileInfo.error" :class="styles.container.error">
        <div>❌ 获取文件信息失败</div>
        <div>{{ fileInfo.error }}</div>
    </div>
    <div v-else-if="fileInfo.isLoading || (!fileInfo.isLoading && !fileInfo.isReady)" :class="styles.container.loading">
        <div class="skeleton w-80 h-7"></div>
    </div>
    <div v-else :class="styles.container.main">
        <div :class="styles.fileInfo.container">
            <span :class="styles.fileInfo.name">
                {{ fileInfo.state?.file_name?.toUpperCase() }}
            </span>
            <span :class="styles.fileInfo.size">
                {{ formatFileSize(Number(fileInfo.state?.file_size)) }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { formatFileSize } from "../../../../utils/format";
import type { useDataFileInfo } from "../../data/useDataFileInfo";

const props = defineProps<{
	// 文件信息
	fileInfo: ReturnType<typeof useDataFileInfo>;
}>();

const styles = {
	// 容器样式
	container: {
		main: "flex items-center gap-4 w-full mx-2",
		error: "text-red-400",
		loading: "flex items-center",
	},
	// 文件信息样式
	fileInfo: {
		container: "flex items-baseline gap-2 flex-1 min-w-0",
		name: "font-bold text-base-content text-xl text-shadow-xs/60 line-clamp-2",
		size: "text-base-content font-semibold text-shadow-xs/60 whitespace-nowrap flex-shrink-0",
	},
};
</script> 