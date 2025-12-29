<template>
  <div :class="styles.progressBar.root">
    <!-- 进度条外容器 -->
    <div
      ref="progressBarWrapperRef"
      :class="styles.progressBar.wrapper"
      @mousedown="handleBarWrapperMouseDown"
      @mouseenter="handleBarWrapperMouseEnter"
      @mousemove="handleBarWrapperMouseMoveWithThrottle"
      @mouseleave="handleBarWrapperMouseLeave"
    >
      <!-- 进度条内容器 -->
      <div :class="[styles.progressBar.track]">
        <!-- 原始播放进度（拖拽时保持显示） -->
        <div
          :class="styles.thumb.current"
          :style="{
            transform: `scaleX(${progressValue / 100})`,
            opacity: isDragging ? 0 : 1,
          }"
        />

        <!-- 拖拽时的实时进度 -->
        <div
          v-if="isDragging && !isLongPressDragging"
          :class="[styles.thumb.current, styles.thumb.dragging]"
          :style="{ transform: `scaleX(${dragProgress / 100})` }"
        />

        <!-- 预览进度 -->
        <div
          v-show="isPreviewVisible && !isDragging"
          :class="styles.thumb.hover"
          :style="{ transform: `scaleX(${previewProgress / 100})` }"
        />

        <!-- 原始进度拖拽点 -->
        <div
          v-if="isDragging"
          :class="styles.handle.container"
          :style="{
            left: 0,
            transform: `translateX(${(progressBarWidth * originalProgress) / 100}px) translateX(-50%)`,
          }"
        >
          <div :class="[styles.handle.base, styles.handle.original]" />
        </div>

        <!-- 当前进度拖拽点 -->
        <div
          :class="styles.handle.container"
          :style="{
            left: 0,
            transform: `translateX(${(progressBarWidth * (isDragging ? dragProgress : progressValue)) / 100}px) translateX(-50%)`,
          }"
        >
          <div
            :class="[
              styles.handle.base,
              isHovering && styles.handle.visible,
              isDragging && styles.handle.dragging,
            ]"
          />
        </div>
      </div>
    </div>
    <!-- 缩略图预览 -->
    <Thumbnail
      ref="thumbnailRef"
      :visible="isPreviewVisible || isDragging"
      :position="isDragging ? dragProgress : previewProgress"
      :time="previewTime"
      :progress-bar-width="progressBarWidth"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePlayerContext } from '../../hooks/usePlayerProvide'
import Thumbnail from '../Thumbnail/index.vue'

/** 样式抽象 */
const styles = {
  progressBar: {
    root: 'relative',
    wrapper: 'py-2 cursor-pointer relative',
    track:
      'h-1 bg-base-content/30 relative transition-[height] duration-100 ease-linear shadow-xl/60',
  },
  thumb: {
    current:
      'absolute h-full w-full bg-primary origin-left transition-transform duration-100 linear',
    dragging: 'transition-none',
    hover: 'absolute h-full w-full bg-primary origin-left pointer-events-none',
  },
  handle: {
    container: 'absolute h-full',
    base: [
      'absolute top-1/2 left-1/2 size-3.5',
      'bg-primary rounded-full drop-shadow-xs/60',
      '-translate-x-1/2 -translate-y-1/2 scale-0',
      'transition-all duration-100 ease-linear pointer-events-none',
    ],
    visible: 'scale-100',
    dragging: '!scale-80 bg-base-content! duration-450 ring-4 ring-primary',
    original: '!bg-white/50 !scale-100',
  },
}

const { progressBar } = usePlayerContext()

/** 缩略图组件引用 */
const thumbnailRef = ref<any>(null)

/** 从 hook 中解构所有需要的状态和方法 */
const {
  progressBarWrapperRef,
  progressBarWidth,
  progressValue,
  isDragging,
  isLongPressDragging,
  isHovering,
  dragProgress,
  originalProgress,
  previewTime,
  previewProgress,
  isPreviewVisible,
  handleBarWrapperMouseDown,
  handleBarWrapperMouseEnter,
  handleBarWrapperMouseMoveWithThrottle,
  handleBarWrapperMouseLeave,
  setThumbnailRef,
} = progressBar

/** 将 thumbnailRef 传递给 hook */
watch(thumbnailRef, (newRef) => {
  setThumbnailRef(newRef)
}, { immediate: true })
</script>
