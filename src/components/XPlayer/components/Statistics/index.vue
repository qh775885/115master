<template>
  <div
    :class="$style['panel']"
  >
    <div :class="$style['panel-header']">
      <h3>Statistics</h3>
      <button :class="$style['close']" @click="statistics.toggleVisible" title="关闭">
        <Icon :svg="CloseSvg"></Icon>
      </button>
    </div>
    <div :class="$style['panel-body']">
      <div :class="$style['section']">
        <h4>Player Core</h4>
        <div :class="$style['section-body']">
          <div :class="$style['section-item']">
            <span>Core Type:</span>
            <span>{{ playerCore?.type ?? 'unknown' }}</span>
          </div>
        </div>
      </div>

      <div :class="$style['section']">
        <h4>Source Info</h4>
        <div :class="$style['section-body']">
          <div :class="$style['section-item']">
            <span>Current Source:</span>
            <span>{{ source?.current.value?.name || '未加载' }}</span>
          </div>
          <div :class="$style['section-item']">
            <span>Type:</span>
            <span>{{ source?.current.value?.type || '未知' }}</span>
          </div>
          <div :class="$style['section-item']">
            <span>Extension:</span>
            <span>{{ source?.current.value?.extension || 'unknown' }}</span>
          </div>
          <div :class="$style['section-item']">
            <span>URL:</span>
            <span :class="$style['url-text']">{{ source?.current.value?.url || '未加载' }}</span>
          </div>
        </div>
      </div>

      <template v-if="playerCore?.type === PlayerCoreType.AvPlayer">
        <div v-if="playerCore.streams" :class="$style['section']">
          <h4>
            Streams 
            <span :class="$style['stream-count']">({{ playerCore.streams.length }})</span>
          </h4>
          <div v-for="stream in playerCore.streams" :key="stream.id" 
            :class="[
              $style['subsection'], 
              {
                [$style['active']]: [playerCore.audioStreamId, playerCore.videoStreamId, playerCore.subtitleStreamId].includes(stream.id)
              }
            ]"
          >
            <div :class="$style['subsection-header']">
              <span :class="$style['stream-type']">{{ stream.mediaType }}</span>
              <span :class="$style['stream-id']">ID: {{ stream.id }}</span>
            </div>
            <div :class="$style['subsection-content']">
              <div :class="$style['section-item']">
                <span>support:</span>
                <span>{{ playerCore.isSupportStream(stream) ? 'Yes' : 'No' }}</span>
              </div>
              <div :class="$style['section-item']">
                <span>codecId:</span>
                <span>{{ stream.codecparProxy.codecId }}</span>
              </div>
              <template v-if="stream.mediaType === 'Audio'">
                <div :class="$style['section-item']">
                  <span>nbChannels:</span>
                  <span>{{ stream.codecparProxy.chLayout.nbChannels }}</span>
                </div>
              </template>
              <div :class="$style['section-item']" v-for="(value, key) of stream.metadata" :key="key">
                <span>{{ key }}:</span>
                <span>{{ value }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="playerCore.stats" :class="$style['section']">
          <h4>Core Stats</h4>
          <div 
            :class="$style['section-item']"
            v-for="key in Object.keys(playerCore.stats)" :key="key">
            <span>{{ key }}</span>
            <span>{{ playerCore.stats[key] }}</span>
          </div>
          <div :class="$style['section-item']">
            <span>A-V:</span>
            <span>{{ playerCore.stats.audioCurrentTime - playerCore.stats.videoCurrentTime }}</span>
          </div>
        </div>
      </template>
      

      <div v-if="playerCore?.loadError" :class="$style['section']">
        <h4>错误信息</h4>
        <div :class="$style['error']">
          {{ formatError(playerCore.loadError) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CloseSvg from "@material-symbols/svg-400/rounded/close.svg?component";
import { isReactive, watch } from "vue";
import { isRef } from "vue";
import Icon from "../../../Icon/index.vue";
import { PlayerCoreType } from "../../hooks/playerCore/types";
import { usePlayerContext } from "../../hooks/usePlayerProvide";

// 读取播放器上下文
const { playerCore, source, statistics } = usePlayerContext();

// 格式化错误信息
const formatError = (error: unknown): string => {
	if (error instanceof Error) {
		return `${error.name}: ${error.message}`;
	}
	return String(error);
};
</script>

<style module>
.panel {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 680px;
  max-height: calc(80% - 20px);
  background-color: rgba(0, 0, 0, 0.9);
  border-radius: 16px;
  color: #fff;
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-size: 12px;
  backdrop-filter: blur(20px) saturate(180%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

.close {
  display: flex;
  gap: 8px;
  background: none;
  border: none;
  color: #fff;
  opacity: 0.7;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: opacity 0.2s, background-color 0.2s;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
}

.panel-body {
  padding: 10px 15px;
  overflow-y: auto;
  flex: 1;
  * {
    user-select: text !important;
  }
}

.section {
  margin-bottom: 20px;
}

.section h4 {
  font-size: 13px;
  font-weight: 500;
  margin: 0 0 8px 0;
  color: #ddd;
}

.section-body {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;
}

.section-item {
  display: flex;
  justify-content: space-between;
  /* flex-wrap: wrap; */
  padding: 4px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  gap: 8px;
  &:last-child {
    border-bottom: none;
  }
  span {
    white-space: pre-wrap;
    word-break: break-all;
    &:first-of-type {
      min-width: 100px;
      flex-shrink: 0;
    }
  }
}

.section-item span:first-child {
  color: #aaa;
}

.url-text {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
}

.error {
  padding: 8px;
  background-color: rgba(255, 50, 50, 0.1);
  border-left: 3px solid rgba(255, 50, 50, 0.5);
  border-radius: 4px;
  word-break: break-word;
  font-family: monospace;
  white-space: pre-wrap;
}

.subsection {
  margin-bottom: 10px;
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  &.active {
    background-color: color-mix(in srgb, var(--color-primary) 15%, transparent);
  }
  &.active:hover {
    background-color: color-mix(in srgb, var(--color-primary) 20%, transparent);
  }
}

.subsection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.stream-type {
  font-weight: 500;
}

.stream-id {
  color: #aaa;
}

.subsection-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stream-count {
  font-size: 12px;
  color: #999;
  font-weight: normal;
  margin-left: 5px;
}
</style> 