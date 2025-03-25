<template>
    <!-- 文件名 -->
    <div :class="$style['header-file']" v-if="fileInfo.error">
        <div class="header-file-error">
            <div>❌ 获取文件信息失败</div>
            <div>{{ fileInfo.error }}</div>
        </div>
    </div>
    <div :class="$style['header-file']" v-else-if="fileInfo.isLoading || (!fileInfo.isLoading && !fileInfo.isReady)">
        <Skeleton width="320px" height="28px" />
    </div>
    <div :class="$style['file-info-container']" v-else>
        <div :class="$style['header-file']">
            <span :class="$style['header-file-text']">
                {{ fileInfo.state?.file_name?.toUpperCase() }}
                <span :class="$style['header-file-text-size']">
                    {{ formatFileSize(Number(fileInfo.state?.file_size)) }}
                </span>
            </span>
        </div>
        <div :class="$style['action-bar']">
            <button :class="$style['action-bar-button']" @click="mark.toggleMark">
                <Icon class="action-bar-button-icon" :svg="mark.isMark.value ? StarFillSvg : StarSvg" />
                <span>收藏</span>
            </button>
        </div>
    </div>
</template>
<script setup lang="ts">
import StarFillSvg from "@material-symbols/svg-400/rounded/star-fill.svg?component";
import StarSvg from "@material-symbols/svg-400/rounded/star.svg?component";
import Icon from "../../../../components/Icon/index.vue";
import Skeleton from "../../../../components/Skeleton/index.vue";
import { formatFileSize } from "../../../../utils/format";
import type { useDataFileInfo } from "../../data/useDataFileInfo";
import type { useMark } from "../../data/useDataMark";

const props = defineProps<{
	fileInfo: ReturnType<typeof useDataFileInfo>;
	mark: ReturnType<typeof useMark>;
}>();
</script>

<style module>
.file-info-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
    margin-bottom: 8px;
}

.header-file {
	display: flex;
	gap: 8px;
	font-size: 20px;
    font-weight: bold;
    flex: 1;
}

.header-file-text {
	color: #f1f1f1;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}

.header-file-text-size {
	color: #999;
    font-size: 12px;
    margin-left: 8px;
    white-space: nowrap;
}

.action-bar {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-left: 16px;
    flex-shrink: 0;
}

.action-bar-button {
    display: flex;
    align-items: center;
    gap: 4px;
    background-color: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 8px;
    color: #f1f1f1;
    font-size: 14px;
    padding: 8px 16px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.action-bar-button:hover {
    background-color: rgba(255, 255, 255, 0.2);
}

.action-bar-button svg {
    width: 24px !important;
    height: 24px !important;
}
</style>