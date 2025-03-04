<template>
	<div class="playlist">
		<div class="playlist-header">
			播放列表
		</div>

		<div class="playlist-list" v-if="playlist.error">
			<LoadingError></LoadingError>
		</div>
		<div class="playlist-list" v-else-if="playlist.isLoading || (!playlist.isLoading && !playlist.isReady)">
			<Skeleton width="100%" height="60.5px" border-radius="8px" v-for="i in 1" :key="i" />
		</div>
		
		<div class="playlist-list" v-else>
			<div class="playlist-item" v-for="item in playlist.state" :key="item.pc"
				:class="{ active: item.pc === pickCode }"
				@click="handlePlay(item)"
			>
				<div class="playlist-item-title">
					{{ item.n }}
				</div>
				<div class="playlist-item-size">
					{{ formatFileSize(item.s) }}
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import LoadingError from "../../../../components/LoadingError/index.vue";
import Skeleton from "../../../../components/Skeleton/index.vue";
import type { Entity } from "../../../../utils/drive115";
import { formatFileSize } from "../../../../utils/format";
import type { useDataPlaylist } from "../../data/useDataPlaylist";
const props = defineProps<{
	playlist: ReturnType<typeof useDataPlaylist>;
	pickCode: string | null;
}>();

const emit = defineEmits<(e: "play", item: Entity.PlaylistItem) => void>();

const handlePlay = (item: Entity.PlaylistItem) => {
	if (item.pc === props.pickCode) {
		return;
	}
	emit("play", item);
};
</script>

<style scoped>
.playlist {
	position: relative;
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	background-color: rgba(0,0,0,.9);
	color: #fff;
    box-sizing: border-box;
    border-radius: 16px;
    z-index: 1;
	overflow: hidden;
}

.playlist-header {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	z-index: 2;
	font-size: 20px;
	color: #eee;
	padding: 20px 28px;
}

.playlist-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 12px 16px 20px;
	margin-top: 68px;
	overflow-y: auto;
}

.playlist-item {
	padding: 12px;
	border-radius: 8px;
	transition: background-color 0.2s ease;
	cursor: pointer;
	gap: 2px;
	color: #eee;
	word-wrap: break-word;
}

.playlist-item:hover {
	background-color: rgba(255, 255, 255, 0.1);
}

.playlist-item.active {
	background-color: rgba(255, 255, 255, 0.2);
}

.playlist-item-title {
	font-size: 14px;
}

.playlist-item-size {
	font-size: 12px;
	color: #999;
}

/* 自定义滚动条样式 */
.playlist::-webkit-scrollbar {
	width: 6px;
}

.playlist::-webkit-scrollbar-track {
	background: transparent;
}

.playlist::-webkit-scrollbar-thumb {
	background-color: rgba(255, 255, 255, 0.2);
	border-radius: 3px;
}

.playlist::-webkit-scrollbar-thumb:hover {
	background-color: rgba(255, 255, 255, 0.3);
}
</style>