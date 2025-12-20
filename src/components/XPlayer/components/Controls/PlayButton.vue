<template>
  <button
    class="swap swap-rotate" :class="[
      styles.btn.root,
      {
        'swap-active': playerCore?.paused,
      },
    ]"
    :disabled="!playerCore?.canplay"
    :data-tip="playTip"
    @click="playerCore?.togglePlay"
  >
    <Icon
      :icon="ICONS.ICON_PASUE" class="swap-off" :class="[
        styles.btn.icon,
      ]"
    />
    <Icon
      :icon="ICONS.ICON_PLAY" class="swap-on" :class="[
        styles.btn.icon,
      ]"
    />
  </button>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { usePlayerContext } from '../../hooks/usePlayerProvide'
import { ICONS } from '../../index.const'
import { controlStyles } from '../../styles/common'

const styles = {
  btn: {
    ...controlStyles.btn,
    root: [controlStyles.btn.root, 'before:ml-8'],
  },
}

const NAME = '播放/暂停'

const { playerCore, shortcuts } = usePlayerContext()

const playTip = computed(() => {
  const tip = shortcuts.getShortcutsTip('togglePlay')
  return `${NAME}${tip}`
})
</script>
