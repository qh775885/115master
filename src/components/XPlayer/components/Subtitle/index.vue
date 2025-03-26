<template>
    <div :class="$style['subtitle-container']">
        <div :class="$style['subtitle-content']" v-if="currentSubtitle">
            {{ currentSubtitle.text }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { useElementBounding } from "@vueuse/core";
import { computed, shallowRef, watch } from "vue";
import { usePlayerContext } from "../../hooks/usePlayerProvide";
import type { Subtitle } from "../../types";

const { subtitles, progress, cssVar, refs } = usePlayerContext();
// 安全区域底部
const safeAreaBottom = computed(() => cssVar?.safeAreaBottom.value);
// 当前字幕
const current = computed(() => subtitles.current.value);
// 视频元素的边界
const text = shallowRef<string | null>(null);
const videoElementBounding = useElementBounding(refs.videoElementRef);
// 字幕字体大小
const fontSize = computed(
	() => `${videoElementBounding.height.value * 0.044}px`,
);

/**
 * 解析后的字幕
 */
const subtitleParsed = shallowRef<
	{
		start: string;
		end: string;
		text: string;
		st: number;
		et: number;
	}[]
>([]);

/**
 * 当前字幕
 */
const currentSubtitle = computed(() => {
	return subtitleParsed.value.find((subtitle) => {
		return (
			subtitle.st <= progress.currentTime.value &&
			subtitle.et >= progress.currentTime.value
		);
	});
});

/**
 * 将时间转换为秒
 * @param time 时间字符串, 格式为 HH:MM:SS.MS
 * @returns 秒
 */
const timeToSeconds = (time: string) => {
	const [hours, minutes, seconds] = time.split(":").map(Number);
	const [secondsPart, msPart] = seconds.toString().split(".");
	return (
		hours * 3600 +
		minutes * 60 +
		parseInt(secondsPart) +
		parseInt(msPart) / 1000
	);
};

/**
 * 解析字幕
 * @param text 字幕文本
 */
const parseSubtitle = (text: string) => {
	const lines = text.split(/\n\n/).filter((line) => line.trim() !== "");
	const subtitles = [];
	for (const line of lines) {
		if (/WEBVTT/.test(line)) continue;

		const [time, text] = line.split(/\n/);
		const [start, end] = time.split("-->");
		const st = timeToSeconds(start);
		const et = timeToSeconds(end);
		subtitles.push({ start, end, text, st, et });
	}
	subtitleParsed.value = subtitles;
};

/**
 * 加载字幕
 * @param subtitle 字幕
 */
const loadSubtitle = async (subtitle: Subtitle | null) => {
	if (!subtitle) {
		text.value = null;
		return;
	}
	const response = await fetch(subtitle.url);
	const blob = await response.blob();
	text.value = await blob.text();
	parseSubtitle(text.value);
};

watch(current, () => {
	loadSubtitle(current.value);
});
</script>

<style module>
.subtitle-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
.subtitle-content {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: calc(v-bind(safeAreaBottom) + 3%);
    max-width: 80%;
    margin: 0 auto;
    padding: 0 0.25em;
	background-color: rgba(8, 8, 8, 0.75);
	white-space: pre-wrap;
    color: #fff;
    font-size: v-bind(fontSize);
    text-align: center;
}
</style>