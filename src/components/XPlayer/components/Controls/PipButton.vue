<template>
  <button
    class="swap swap-rotate" :class="[styles.btn.root, { 'swap-active': !pictureInPicture.isPip.value }]"
    :data-tip="pipTip" :disabled="playerCore?.type === PlayerCoreType.AvPlayer" @click="pictureInPicture.toggle"
  >
    <Icon :icon="ICON_PIP_EXIT" class="swap-off" :class="[styles.btn.icon]" />
    <Icon :icon="ICON_PIP" class="swap-on" :class="[styles.btn.icon]" />
  </button>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { PlayerCoreType } from '../../hooks/playerCore/types'
import { usePlayerContext } from '../../hooks/usePlayerProvide'
import { controlStyles } from '../../styles/common'
import { ICON_PIP, ICON_PIP_EXIT } from '../../utils/icon'

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
