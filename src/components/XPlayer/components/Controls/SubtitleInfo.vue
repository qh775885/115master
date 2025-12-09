<template>
  <transition
    enter-active-class="transition-all duration-200 ease-out"
    leave-active-class="transition-all duration-200 ease-out"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <div
      v-if="currentSubtitle"
      :class="[styles.root]"
    >
      <Icon :icon="ICON_SUBTITLES" :class="[styles.icon]" />
      <SubtitleDisplay
        :label="currentSubtitle.label"
        :format="currentSubtitle.format"
        :source="currentSubtitle.source"
        :subtitle-index="subtitles.currentIndex.value"
        :total="subtitles.total.value"
      />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { usePlayerContext } from '../../hooks/usePlayerProvide'
import { ICON_SUBTITLES } from '../../utils/icon'
import SubtitleDisplay from '../SubtitleDisplay.vue'

const { subtitles, controls, progressBar } = usePlayerContext()

const styles = {
  root: 'absolute left-5 bottom-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-sm text-white shadow-lg pointer-events-none',
  icon: 'size-5 opacity-80',
}

/** 当前字幕 */
const currentSubtitle = computed(() => {
  if (!subtitles.current.value) {
    return null
  }
  if (!controls.visible.value || progressBar.isLongPressDragging.value) {
    return null
  }
  return subtitles.current.value
})
</script>
