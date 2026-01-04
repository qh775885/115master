<template>
  <div :class="styles.root">
    <span v-if="subtitleIndex !== null" :class="styles.index">{{ subtitleIndex }}/{{ total }}</span>
    <div :class="styles.content">
      <span :class="styles.label">{{ label }}</span>
    </div>
    <div :class="styles.meta">
      <span v-if="format" :class="styles.format">
        {{ format.toUpperCase() }}
      </span>
      <span v-if="source" :class="styles.source">
        {{ source }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { clsx } from '../../../utils/clsx'

defineProps<{
  label: string
  format?: string
  source?: string
  subtitleIndex: number | null
  total: number
}>()

const styles = clsx({
  root: 'text-base-content flex w-full items-center gap-2',
  index: 'w-12 flex-shrink-0 text-sm tracking-wide whitespace-nowrap proportional-nums',
  content: 'min-w-0 flex-1',
  label: 'line-clamp-2 font-medium break-all',
  meta: 'flex flex-shrink-0 items-center gap-1.5',
  format: 'rounded-md bg-white/30 px-1.5 py-[1px] text-xs whitespace-nowrap',
  source: 'rounded-md bg-white/30 px-1.5 py-[1px] text-xs whitespace-nowrap',
})
</script>
