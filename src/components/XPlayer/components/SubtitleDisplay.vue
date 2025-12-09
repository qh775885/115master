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
        · {{ source }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  format?: string
  source?: string
  subtitleIndex: number | null
  total: number
}>()

const styles = {
  root: 'flex items-center gap-2 w-full',
  index: 'text-xs opacity-70 font-mono whitespace-nowrap w-12 flex-shrink-0',
  content: 'flex-1 min-w-0',
  label: 'font-medium line-clamp-2 break-all',
  meta: 'flex items-center gap-1.5 flex-shrink-0',
  format: 'text-xs opacity-60 px-1.5 py-0.5 rounded bg-white/30 font-mono whitespace-nowrap',
  source: 'text-xs opacity-70 font-mono whitespace-nowrap',
}
</script>
