<template>
  <template v-if="shouldShow">
    <!-- 上一个视频 -->
    <button
      :class="styles.btn.root"
      :disabled="isPreviousDisabled"
      data-tip="上一个 (Ctrl+←)"
      @click="handlePrevious"
    >
      <Icon :icon="ICON_SKIP_PREVIOUS" :class="styles.btn.icon" />
    </button>
    <!-- 下一个视频 -->
    <button
      :class="styles.btn.root"
      :disabled="isNextDisabled"
      data-tip="下一个 (Ctrl+→)"
      @click="handleNext"
    >
      <Icon :icon="ICON_SKIP_NEXT" :class="styles.btn.icon" />
    </button>
  </template>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { usePlayerContext } from '../../hooks/usePlayerProvide'
import { controlStyles } from '../../styles/common'
import { ICON_SKIP_NEXT, ICON_SKIP_PREVIOUS } from '../../utils/icon'

const styles = {
  btn: controlStyles.btn,
}

const { rootProps } = usePlayerContext()

const shouldShow = computed(() => {
  return (rootProps.playlistCount ?? 0) > 1
})

const isPreviousDisabled = computed(() => {
  return (rootProps.playlistIndex ?? 0) <= 0 || !rootProps.onPrevious
})

const isNextDisabled = computed(() => {
  const count = rootProps.playlistCount ?? 0
  const index = rootProps.playlistIndex ?? 0
  return index >= count - 1 || !rootProps.onNext
})

function handlePrevious() {
  if (!isPreviousDisabled.value) {
    rootProps.onPrevious?.()
  }
}

function handleNext() {
  if (!isNextDisabled.value) {
    rootProps.onNext?.()
  }
}
</script>
