<template>
  <button
    :class="[styles.btn.root]"
    :title="tip"
    :disabled="disabled"
    @click="onClick"
  >
    <Icon :class="[styles.btn.icon]" :icon="icon" />
  </button>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { clsx } from '../../../../utils/clsx'
import { usePlayerContext } from '../../hooks/usePlayerProvide'
import { ICONS } from '../../index.const'
import { controlStyles } from '../../styles/common'

const props = defineProps<{
  type: 'playPrevious' | 'playNext'
  disabled?: boolean
  onClick: () => void
}>()

const BTN_ICONS = {
  playPrevious: ICONS.ICON_PREV,
  playNext: ICONS.ICON_NEXT,
} satisfies Record<typeof props.type, string>

const LABELS = {
  playPrevious: '上一集',
  playNext: '下一集',
} satisfies Record<typeof props.type, string>

const styles = clsx({
  btn: controlStyles.btn,
})

const ctx = usePlayerContext()

const icon = computed(() => {
  return BTN_ICONS[props.type]
})

const tip = computed(() => {
  const label = LABELS[props.type]
  const tip = ctx.shortcuts.getShortcutsTip(props.type)
  return `${label}${tip}`
})
</script>
