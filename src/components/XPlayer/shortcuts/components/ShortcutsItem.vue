<template>
  <div :class="[styles.row, conflictMessage && styles.rowWithConflict]">
    <span :class="styles.label">
      {{ action.name }}
    </span>
    <div :class="styles.keysWrapper">
      <div :class="styles.keys">
        <template v-for="(keyStr, index) in keyBindings" :key="index">
          <KeyRecorder
            :model-value="keyStr"
            :error="isError(keyStr)"
            @update:model-value="handleUpdate(index, $event)"
          />
        </template>
        <KeyRecorder
          v-if="shouldShowAddRecorder"
          model-value=""
          @update:model-value="handleUpdate(keyBindings.length, $event)"
        />
      </div>
      <span v-if="conflictMessage" :class="styles.conflict">{{ conflictMessage }}</span>
      <span>{{ action.tip }}</span>
    </div>
    <button v-if="isModified" :class="styles.reset" type="button" title="重置" @click="handleReset">
      <Icon :icon="ICON_RESET" class="size-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * 组件: 快捷键 Item
 * @description 用于显示快捷键项
 */

import type { Action, ActionKey, KeyBindings, KeyBindingStr } from '../shortcuts.types'
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { usePlayerContext } from '../../hooks/usePlayerProvide'
import { ICON_RESET } from '../../utils/icon'
import {
  hasEmptyKeybindings,
  isMaxKeybindings,
  isSameKeyBindings,
} from '../shortcuts.utils'
import KeyRecorder from './KeyRecorder.vue'

const props = defineProps<{
  actionKey: ActionKey
  action: Action
  keyBindings: KeyBindingStr[]
}>()

const emit = defineEmits<{
  'update:key-bindings': [value: KeyBindings ]
  'reset': []
}>()

const styles = {
  row: [
    'group/row',
    'grid grid-cols-[110px_1fr_auto] items-start',
    'gap-4 px-5 py-2.5',
    'min-h-13',
    'rounded-xl',
    'transition-colors',
    'hover:bg-base-200/70',
  ],
  rowWithConflict: 'pb-1',
  label: [
    'text-sm text-base-content/75 truncate',
    'pt-1',
  ],
  keysWrapper: 'flex flex-col gap-1',
  keys: [
    'flex flex-wrap items-center',
    'gap-3',
  ],
  reset: [
    'btn btn-sm btn-ghost btn-circle btn-error',
  ],
  conflict: 'text-xs font-medium text-error',
}

const { shortcuts } = usePlayerContext()

/** 默认绑定键 */
const defaultKeyBindings = computed(() => {
  const mergedDefaultActionKeyBindings = shortcuts.mergedDefaultActionKeyBindings.value
  return mergedDefaultActionKeyBindings[props.actionKey] || []
})

/** 是否修改过 */
const isModified = computed(() => {
  const curr = props.keyBindings
  const def = defaultKeyBindings.value
  return !isSameKeyBindings(curr, def)
})

/** 冲突消息 */
const conflictMessage = computed(() => {
  const conflicts = shortcuts.conflicts.value
  const actionMap = shortcuts.mergedActionMap.value
  const keyBindings = props.keyBindings

  let hasSelfConflict = false
  const otherConflictNames = new Set<string>()

  keyBindings.forEach((keyBinding) => {
    const list = conflicts.get(keyBinding)
    if (list) {
      list.forEach((item) => {
        if (item.actionKey === props.actionKey) {
          hasSelfConflict = true
        }
        else {
          const action = actionMap[item.actionKey]
          if (action) {
            otherConflictNames.add(action.name)
          }
        }
      })
    }
  })

  const messages: string[] = []

  if (hasSelfConflict) {
    messages.push('快捷键重复')
  }

  if (otherConflictNames.size > 0) {
    const names = Array.from(otherConflictNames).map(n => `「${n}」`).join('、')
    messages.push(`与 ${names} 冲突`)
  }

  return messages.join('，')
})

/** 是否显示添加录制器 */
const shouldShowAddRecorder = computed(() => {
  /** 检查是否超过最大快捷键数量 */
  const overflow = isMaxKeybindings(props.keyBindings, props.action)
  if (overflow) {
    return false
  }
  // 检查是否包含空快捷键
  if (hasEmptyKeybindings(props.keyBindings)) {
    return false
  }

  return true
})

/** 是否有冲突 */
function isError(keyStr: KeyBindingStr) {
  return (shortcuts.conflicts.value.get(keyStr)?.length ?? 0) > 0
}

/** 处理更新 */
function handleUpdate(index: number, value: KeyBindingStr) {
  const arr = [...props.keyBindings]
  if (value) {
    arr[index] = value
  }
  else if (index < props.keyBindings.length) {
    arr.splice(index, 1)
  }
  emit('update:key-bindings', arr)
}

/** 重置 */
function handleReset() {
  emit('reset')
}
</script>
