<template>
  <button
    :class="[styles.btn.root]"
    :data-tip="tip"
    :disabled="disabled"
    @click="onClick"
  >
    <Icon :class="[styles.btn.icon]" :icon="icon" />
  </button>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { usePlayerContext } from '../../hooks/usePlayerProvide'
import { controlStyles } from '../../styles/common'
import { ICON_NEXT, ICON_PREV } from '../../utils/icon'

const props = defineProps<{
  type: 'playPrevious' | 'playNext'
  disabled?: boolean
  onClick: () => void
}>()

const ICONS = {
  playPrevious: ICON_PREV,
  playNext: ICON_NEXT,
} satisfies Record<typeof props.type, string>

const LABELS = {
  playPrevious: '上一集',
  playNext: '下一集',
} satisfies Record<typeof props.type, string>

const styles = {
  btn: controlStyles.btn,
}

const ctx = usePlayerContext()

const icon = computed(() => {
  return ICONS[props.type]
})

const tip = computed(() => {
  const label = LABELS[props.type]
  const tip = ctx.shortcuts.getShortcutsTip(props.type)
  return `${label}${tip}`
})
</script>
