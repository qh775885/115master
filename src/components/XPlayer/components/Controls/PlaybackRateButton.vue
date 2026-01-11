<template>
  <button
    ref="buttonRef"
    :class="[styles.btnText.root]"
    :disabled="!playerCore?.canplay"
    :title="playbackRateTip"
    @click="toggleSpeedMenu"
  >
    <Icon v-if="playbackRate.current.value === 1" :class="styles.btn.icon" :icon="ICONS.ICON_PLAYBACK_RATE" />
    <span v-else>{{ buttonText }}</span>
  </button>
  <Popup
    v-model:visible="menuVisible"
    :trigger="buttonRef"
    placement="top"
  >
    <ul :class="[styles.menu.root]">
      <li
        v-for="rate in rateOptions"
        :key="rate"
        @click="handleSpeedChange(rate)"
      >
        <a
          :class="[styles.menu.a, {
            [styles.menu.active]: playbackRate.current.value === rate,
          }]"
        >{{ rate }}</a>
      </li>
    </ul>
  </Popup>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, ref, shallowRef } from 'vue'
import { clsx } from '../../../../utils/clsx'
import { usePlayerContext } from '../../hooks/usePlayerProvide'
import { ICONS } from '../../index.const'
import { controlStyles } from '../../styles/common'
import Popup from '../Popup/index.vue'

const styles = clsx({
  ...controlStyles,
})

const NAME = '倍速'

const { playbackRate, playerCore, shortcuts } = usePlayerContext()
const rateOptions = computed(() =>
  [...playbackRate.rateOptions.value].reverse(),
)
const menuVisible = shallowRef(false)
const buttonRef = ref<HTMLElement>()
const buttonText = computed(() => {
  return `${playbackRate.current.value}X`
})

const playbackRateTip = computed(() => {
  const tip = shortcuts.getShortcutsTip('playbackRateUp', 'playbackRateDown')
  return `${NAME}${tip}`
})

/** 切换菜单显示 */
function toggleSpeedMenu() {
  menuVisible.value = !menuVisible.value
}

/** 处理倍速变化 */
function handleSpeedChange(rate: number) {
  playbackRate.set(rate)
  menuVisible.value = false
}
</script>
