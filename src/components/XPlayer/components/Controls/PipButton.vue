<template>
  <button
    class="swap swap-rotate" :class="[styles.btn.root, { 'swap-active': !pictureInPicture.isPip.value }]"
    :data-tip="pipTip" :disabled="playerCore?.type === PlayerCoreType.AvPlayer" @click="pictureInPicture.toggle"
  >
    <Icon :icon="ICONS.ICON_PIP_EXIT" class="swap-off" :class="[styles.btn.icon]" />
    <Icon :icon="ICONS.ICON_PIP" class="swap-on" :class="[styles.btn.icon]" />
  </button>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { PlayerCoreType } from '../../hooks/playerCore/types'
import { usePlayerContext } from '../../hooks/usePlayerProvide'
import { ICONS } from '../../index.const'
import { controlStyles } from '../../styles/common'

const styles = {
  ...controlStyles,
}

const { pictureInPicture, playerCore, shortcuts } = usePlayerContext()

const NAME = '画中画'

const pipTip = computed(() => {
  const tip = shortcuts.getShortcutsTip('togglePictureInPicture')
  return `${NAME}${tip}`
})
</script>
