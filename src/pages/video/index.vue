<template>
	<div :class="[
		$style['page-container'],
		{
			[`${$style['show-playlist']}`]: preferences.showPlaylist,
		}
	]">
		<div :class="$style['page-main']">
			<!-- 视频播放器 -->
			<XPlayer
				ref="xplayerRef"
				:class="$style['video-player']"
				v-model:showPlaylist="preferences.showPlaylist"
				v-model:volume="preferences.volume"
				v-model:muted="preferences.muted"
				v-model:playbackRate="preferences.playbackRate"
				v-model:autoLoadThumbnails="preferences.autoLoadThumbnails"
				v-model:disabledHDR="preferences.disabledHDR"
				v-model:thumbnailsSamplingInterval="preferences.thumbnailsSamplingInterval"
				:sources="DataVideoSources.list"
				:subtitles="DataSubtitles.state"
				:lastTime="DataHistory.lastTime.value"
				:subtitlesLoading="DataSubtitles.isLoading"
				:subtitlesReady="DataSubtitles.isReady"
				:onThumbnailRequest="DataThumbnails.onThumbnailRequest"
				:onSubtitleChange="handleSubtitleChange"
				:onTimeupdate="handleTimeupdate"
				:onSeeking="DataHistory.handleSeek"
				:onSeeked="DataHistory.handleSeek"
				:onCanplay="handleStartAutoBuffer"
			/>
			<!-- 播放列表 -->
			<Playlist
				:class="$style['playlist']"
				:pickCode="params.pickCode.value"
				:playlist="DataPlaylist"
				@play="handleChangeVideo"
				@close="handleClosePlaylist"
			/>
		</div>
		<div :class="$style['page-flow']">
			<!-- 文件信息 -->
			<FileInfo :fileInfo="DataFileInfo" :mark="DataMark" :playlist="DataPlaylist" @localPlay="handleLocalPlay" />
			<!-- 电影信息 -->
			<MovieInfo 
				:movieInfos="DataMovieInfo"
			/>
			<!-- 底部 -->
			<div :class="$style['page-footer']">
				<Footer></Footer>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useTitle } from "@vueuse/core";
import { nextTick, onMounted, ref } from "vue";
import type XPlayerInstance from "../../components/XPlayer/index.vue";
import XPlayer from "../../components/XPlayer/index.vue";
import type { Subtitle } from "../../components/XPlayer/types";
import { useParamsVideoPage } from "../../hooks/useParams";
import { subtitlePreference } from "../../utils/cache/subtitlePreference";
import type { Entity } from "../../utils/drive115";
import { drive115 } from "../../utils/drive115";
import { getAvNumber } from "../../utils/getNumber";
import { goToPlayer } from "../../utils/route";
import { webLinkIINA, webLinkShortcutsMpv } from "../../utils/weblink";
import FileInfo from "./components/FileInfo/index.vue";
import Footer from "./components/Footer/index.vue";
import MovieInfo from "./components/MovieInfo/index.vue";
import Playlist from "./components/Playlist/index.vue";
import { useDataFileInfo } from "./data/useDataFileInfo";
import { useDataHistory } from "./data/useDataHistory";
import { useMark } from "./data/useDataMark";
import { useDataMovieInfo } from "./data/useDataMovieInfo";
import { useDataPlaylist } from "./data/useDataPlaylist";
import { usePreferences } from "./data/usePreferences";
import { useDataSubtitles } from "./data/useSubtitlesData";
import { useDataThumbnails } from "./data/useThumbnails";
import { useDataVideoSources } from "./data/useVideoSource";

// 播放器 Ref
const xplayerRef = ref<InstanceType<typeof XPlayerInstance>>();
// 偏好设置
const preferences = usePreferences();
// 参数
const params = useParamsVideoPage();
// 视频源
const DataVideoSources = useDataVideoSources();
// 缩略图
const DataThumbnails = useDataThumbnails(preferences);
// 字幕
const DataSubtitles = useDataSubtitles();
// 番号信息
const DataMovieInfo = useDataMovieInfo();
// 文件信息
const DataFileInfo = useDataFileInfo();
// 播放列表
const DataPlaylist = useDataPlaylist();
// 历史记录
const DataHistory = useDataHistory();
// 收藏
const DataMark = useMark(DataFileInfo);

// 处理字幕变化
const handleSubtitleChange = async (subtitle: Subtitle | null) => {
	// 保存字幕选择
	await subtitlePreference.savePreference(
		params.pickCode.value ?? "",
		subtitle || null,
	);
};

// 本地播放
const handleLocalPlay = async (player: LocalPlayer) => {
	if (!params.pickCode.value) {
		throw new Error("pickCode is required");
	}
	const download = await drive115.getFileDownloadUrl(params.pickCode.value);
	switch (player) {
		case "mpv":
			open(webLinkShortcutsMpv(download));
			break;
		case "iina":
			xplayerRef.value?.interruptSource();
			setTimeout(() => {
				open(webLinkIINA(download));
			}, 300);
			break;
	}
};

// 播放器列表切换
const handleChangeVideo = async (item: Entity.PlaylistItem) => {
	if (!params.cid.value) {
		throw new Error("cid is required");
	}
	goToPlayer({
		cid: params.cid.value,
		pickCode: item.pc,
	});
	params.getParams();
	DataVideoSources.clear();
	DataThumbnails.clear();
	DataHistory.clear();
	DataSubtitles.execute(0, params.pickCode.value, null);
	DataMovieInfo.javDBState.execute(0);
	DataMovieInfo.javBusState.execute(0);
	await nextTick();
	await loadData(false);
};

// 开始自动缓冲缩略图
const handleStartAutoBuffer = () => {
	DataThumbnails.autoBuffer();
};

// 处理时间更新
const handleTimeupdate = (time: number) => {
	if (!DataHistory.isinit.value) {
		return;
	}
	if (time <= 0) {
		return;
	}
	DataHistory.handleTimeupdate(time);
	if (!params.pickCode.value) {
		throw new Error("pickCode is required");
	}
	DataPlaylist.updateItemTime(params.pickCode.value, time);
};

// 关闭播放列表
const handleClosePlaylist = () => {
	preferences.value.showPlaylist = false;
};

// 加载数据
const loadData = async (isFirst = true) => {
	if (!params.pickCode.value) {
		throw new Error("pickCode is required");
	}
	if (!params.cid.value) {
		throw new Error("cid is required");
	}
	await DataHistory.fetch(params.pickCode.value);
	// 加载视频源
	DataVideoSources.fetch(params.pickCode.value).then(() => {
		// 初始化缩略图
		DataThumbnails.initialize(
			DataVideoSources.list.value,
			preferences.value.thumbnailsSamplingInterval,
		);
	});

	// 加载文件信息
	DataFileInfo.execute(0, params.pickCode.value).then((res) => {
		const avNumber = getAvNumber(res.file_name);
		// 设置标题
		useTitle(DataFileInfo.state.file_name || "");
		// 加载番号信息
		if (avNumber) {
			DataMovieInfo.javDBState.execute(0, avNumber);
			DataMovieInfo.javBusState.execute(0, avNumber);
		}
		// 加载字幕
		DataSubtitles.execute(0, params.pickCode.value, avNumber);
	});

	// 加载播放列表
	isFirst && DataPlaylist.execute(0, params.cid.value);
};

// 挂载
onMounted(async () => {
	await loadData();
});
</script>

<style module>
/* 全局滚动条样式 */
.page-container {
	--page-video-top: 36px;
	--video-player-normal-height: calc(100vh - 24px * 2 - 28px);
	--page-video-offset: 92px;
	--cubic-bezier: ease-in-out;
	--cubic-bezier-duration: 0.2s;
	padding: 0 0 56px;
	background: rgb(15,15,15);
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	color: #f1f1f1;
	align-items: center;
	-webkit-font-smoothing: antialiased;
	gap: 24px;
}

.page-local-play {
	display: inline-flex;
	background: #000;
	color: #fff;
	padding: 10px 20px;
	border-radius: 16px;
	cursor: pointer;
}

.page-body {
	display: flex;
	flex-direction: column;
	gap: 24px;
}

.page-main {
	display: flex;
	width: 100%;
	height: 100vh;
	box-sizing: border-box;
	padding: 0;
	transition:
		padding var(--cubic-bezier-duration) var(--cubic-bezier),
		height var(--cubic-bezier-duration) var(--cubic-bezier);
	will-change: padding, height;
}

.page-flow {
	display: flex;
	flex-direction: column;
	gap: 24px;
	padding: 0 var(--page-video-offset);
	width: 100%;
	box-sizing: border-box;
}

.video-player {
	border-radius: 0;
	overflow: hidden;
	transition: border-radius var(--cubic-bezier-duration) var(--cubic-bezier);
	will-change: border-radius;
}

.playlist {
	width: 0;
	height: 100%;
	opacity: 0;
	margin-left: 0;
	content-visibility: auto;
	flex-shrink: 0;
	transition:
		width var(--cubic-bezier-duration) var(--cubic-bezier),
		opacity var(--cubic-bezier-duration) var(--cubic-bezier);
	will-change: width, opacity, margin-left;
}

.show-playlist {
	.page-main {
		height: var(--video-player-normal-height);
		padding: var(--page-video-top) var(--page-video-offset) 0;
	}
	.playlist {
		width: 460px;
		opacity: 1;
		margin-left: 16px;
	}
	.video-player {
		border-radius: 16px;
	}
}

:fullscreen {
	.page-container {
		padding: 0 0 56px;
	}
	.page-main {
		height: 100vh;
		padding: 0;
		transition: none;
	}
	.video-player {
		max-height: none;
		border-radius: 0;
		transition: none;
	}
	.playlist {
		border-radius: 0;
		margin-left: 0;
		border-left: 1px solid rgba(255, 255, 255, 0.1);
	}
}

@media (max-width: 1600px) {
	.page-container {
		--page-video-offset: 24px;
	}
}

</style>
