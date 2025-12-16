<template>
  <div
    ref="containerRef"
    :class="[
      styles.base,
      isRecording ? styles.recording : '',
      error ? styles.error : '',
    ]"
    tabindex="0"
    @focus="handleStartRecording"
    @blur="handleStopRecording"
    @keydown.prevent="handleKeyDown"
    @keyup.prevent="handleKeyUp"
  >
    <kbd v-if="displayValue" :class="styles.kbd">{{ displayValue }}</kbd>
    <span v-else :class="styles.placeholder">
      {{ isRecording ? '录制中...' : '新增快捷键' }}
    </span>
    <button
      v-if="modelValue && !isRecording"
      :class="styles.remove" type="button"
      @click.stop="handleRemove"
    >
      <Icon :icon="ICON_CLOSE" class="size-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * 组件: 快捷键录制
 * @description 用于录制、显示、移除快捷键
 */

import type { KeyBindingStr } from '../shortcuts.types'
import { Icon } from '@iconify/vue'
import { computed, shallowRef } from 'vue'
import { usePlayerContext } from '../../hooks/usePlayerProvide'
import { ICON_CLOSE } from '../../utils/icon'
import {
  formatKeyDisplay,
  getKeyBindingStringFromEvent,
  isOnlyModifier,
} from '../shortcuts.utils'

const props = withDefaults(defineProps<{
  modelValue?: KeyBindingStr
  error?: boolean
}>(), {
  modelValue: '',
  error: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: KeyBindingStr]
}>()

const styles = {
  base: [
    'relative flex items-center justify-center rounded-full',
    'min-w-25 h-8 px-3',
    'shadow-sm',
    'cursor-pointer select-none transition-all',
    'border-[1px] border-base-content/15',
    'hover:border-base-content/50',
    'focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20',
    'group/recorder',
    'tooltip tooltip-bottom tooltip-error',
  ],
  recording: [
    'border-primary',
    'bg-gradient-to-br from-primary/10 to-primary/5',
    'shadow-md ring-2 ring-primary/30',
  ],
  error: [
    'border-error/60',
    'bg-gradient-to-br from-error/15 to-error/5',
    'shadow-md',
  ],
  kbd: 'text-xs font-semibold font-sans text-base-content/90 ',
  placeholder: 'text-xs text-base-content/45',
  remove: [
    'absolute -right-1.5 -top-1.5 p-1',
    'btn btn-xs btn-error btn-circle',
    'opacity-0 group-hover/recorder:opacity-100',
  ],
}

const ctx = usePlayerContext()
const containerRef = shallowRef<HTMLDivElement>()
const isRecording = shallowRef(false)
const tempKeys = shallowRef<KeyBindingStr>('')

/**
 * 显示值
 */
const displayValue = computed(() => {
  const value = isRecording.value ? tempKeys.value : props.modelValue
  return value ? formatKeyDisplay(value) : ''
})

/**
 * 开始录制
 */
function handleStartRecording() {
  isRecording.value = true
  tempKeys.value = ''
  ctx.shortcuts.recordState.startRecording()
}

/**
 * 停止录制
 */
function handleStopRecording() {
  if (!isRecording.value)
    return
  const value = isOnlyModifier(tempKeys.value) ? '' : tempKeys.value
  tempKeys.value = ''
  isRecording.value = false
  emit('update:modelValue', value)
  ctx.shortcuts.recordState.stopRecording()
}

/**
 * 按键按下事件处理
 * @param event 按键事件
 */
function handleKeyDown(event: KeyboardEvent) {
  if (!isRecording.value)
    return

  if (event.key === 'Escape') {
    containerRef.value?.blur()
    return
  }

  if (event.key === 'Tab') {
    handleStopRecording()
    return
  }

  if (event.repeat)
    return

  tempKeys.value = getKeyBindingStringFromEvent(event)
}

/**
 * 按键抬起事件处理
 */
function handleKeyUp() {
  if (!isRecording.value)
    return
  if (tempKeys.value) {
    emit('update:modelValue', tempKeys.value)
    containerRef.value?.blur()
  }
}

/**
 * 移除快捷键
 */
function handleRemove() {
  emit('update:modelValue', '')
}
</script>
