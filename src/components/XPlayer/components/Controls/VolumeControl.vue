<template>
  <div
    :class="[
      styles.tooltip,
    ]"
  >
    <div v-if="playerCore?.isSuspended" :class="[styles.tooltipContent]">
      <button
        :class="[styles.resumeBtn]"
        @click="() => {
          playerCore?.resumeSuspended();
          hud?.showResumeSuspended();
        }"
      >
        点击恢复音频 {{ muteKey }}
      </button>
    </div>
    <div
      ref="volumeControlRef"
      :class="[styles.root]"
      :data-expended="expanded"
      @wheel.prevent="handleWheelWithThrottle"
    >
      <button
        class="swap swap-rotate" :class="[styles.btn.root, {
          'swap-active': playerCore?.muted,
        }]"
        :title="muteTip"
        :disabled="!playerCore?.canplay || playerCore?.isSuspended"
        @click="playerCore?.toggleMute"
      >
        <Icon
          class="swap-off" :class="[styles.btn.icon]"
          :icon="VolumeIcon"
        />
        <Icon
          class="swap-on" :class="[styles.btn.icon]"
          :icon="VolumeIcon"
        />
      </button>
      <input
        type="range"
        :class="[styles.range]"
        min="0"
        max="100"
        :value="playerCore?.volume ?? 0"
        :disabled="!playerCore?.canplay || playerCore?.isSuspended"
        @input="handleVolumeChange"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useElementHover, useThrottleFn, useTimeoutFn } from '@vueuse/core'
import { computed, shallowRef, watch } from 'vue'
import { usePlayerContext } from '../../hooks/usePlayerProvide'
import { controlStyles } from '../../styles/common'
import { getVolumeIcon } from '../../utils/icon'

const { playerCore, hud, shortcuts } = usePlayerContext()

const styles = computed(() => ({
  root: [
    'flex items-center gap-2',
    'group',
    'w-10',
    'transition-[width,padding] ease-[var(--app-ease-in-out-expo)] duration-500',
    'data-[expended="true"]:w-40',
    'data-[expended="true"]:pl-2',
    'data-[expended="true"]:pr-6',
  ],
  btn: controlStyles.btn,
  range: ['range range-2xs range-primary', 'transition-[width] ease-[var(--app-ease-in-out-expo)] duration-300', 'w-0 group-data-[expended="true"]:w-24'],
  tooltip: [
    'tooltip tooltip-top',
    {
      'tooltip-open': playerCore?.value?.isSuspended,
    },
  ],
  tooltipContent: 'tooltip-content py-2 px-4',
  resumeBtn: 'cursor-pointer pointer-events-auto',
}))

const MUTE_NAME = '静音'

const volumeControlRef = shallowRef<HTMLElement>()
const expanded = shallowRef(false)
const isHovered = useElementHover(volumeControlRef)
const foldCounttime = useTimeoutFn(() => {
  expanded.value = false
}, 200)
const handleWheelWithThrottle = useThrottleFn(handleWheel, 60)

watch(() => isHovered.value, (value) => {
  if (value) {
    expanded.value = true
    foldCounttime.stop()
  }
  else {
    foldCounttime.start()
  }
})

const VolumeIcon = computed(() => {
  return getVolumeIcon(
    playerCore.value?.volume ?? 0,
    playerCore.value?.muted ?? false,
  )
})

const muteKey = computed(() => {
  const tip = shortcuts.getShortcutsTip('toggleMute')
  return tip
})

const muteTip = computed(() => {
  return `${MUTE_NAME}${muteKey.value}`
})

function handleVolumeChange(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  playerCore.value?.setVolume(value)
}

function handleWheel(event: WheelEvent) {
  if (!playerCore.value?.canplay || playerCore.value?.isSuspended) {
    return
  }

  const delta = event.deltaY > 0 ? 5 : -5
  const currentVolume = playerCore.value.volume ?? 0
  const newVolume = Math.min(Math.max(0, currentVolume + delta), 100)
  playerCore.value.setVolume(newVolume)
}
</script>
