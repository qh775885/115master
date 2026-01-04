<template>
  <transition
    enter-active-class="transition-all duration-300 ease-[var(--ease-in-cubic)]"
    leave-active-class="transition-all duration-300 ease-[var(--ease-in-cubic)]"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      ref="controlHeaderRef"
      :class="[styles.root]"
    >
      <div :class="styles.bg" />
      <div
        :class="[
          styles.content.root,
        ]"
      >
        <slot name="left" />
        <slot name="right" />
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useControlsMouseDetection } from '../../hooks/useControlsMouseDetection'
import { usePlayerContext } from '../../hooks/usePlayerProvide'

/** 插槽 */
defineSlots<{
  /** 头部左侧插槽 */
  left: () => void
  /** 头部右侧插槽 */
  right: () => void
}>()

const { controls } = usePlayerContext()

const styles = {
  root: [
    'relative',
    'transform-gpu',
  ],
  content: {
    root: 'relative flex justify-between items-start p-6',
  },
  bg: [
    'absolute inset-0 -bottom-[200%]',
    'bg-[linear-gradient(to_bottom,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.14)_15%,rgba(0,0,0,0.08)_35%,rgba(0,0,0,0.03)_60%,rgba(0,0,0,0)_100%)]',
    'pointer-events-none',
  ],
}

const controlHeaderRef = shallowRef<HTMLDivElement | null>(null)

useControlsMouseDetection(controlHeaderRef)

/** 显示/隐藏控制栏 */
const show = computed(() => {
  return controls.visible.value
})
</script>
