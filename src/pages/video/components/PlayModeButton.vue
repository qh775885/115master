<template>
  <button
    ref="buttonRef"
    :class="[styles.btn.root]"
    :data-tip="playModeTip"
    @click="toggleMenu"
  >
    <Icon :icon="currentModeIcon" :class="[styles.btn.icon]" />
  </button>
  <Popup
    v-model:visible="menuVisible"
    :trigger="buttonRef"
    placement="top"
  >
    <ul :class="[styles.menu.root]">
      <li
        v-for="mode in modeOptions"
        :key="mode.value"
        @click="handleModeChange(mode.value)"
      >
        <a
          :class="[styles.menu.a, {
            [styles.menu.active]: currentMode === mode.value,
          }]"
        >
          <Icon :icon="mode.icon" class="size-4" />
          {{ mode.label }}
        </a>
      </li>
    </ul>
  </Popup>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, ref, shallowRef } from 'vue'
import { controlStyles } from '../../../components/XPlayer/styles/common'
import Popup from '../../../components/XPlayer/components/Popup/index.vue'
import { PlayMode } from '../data/usePreferences'

/** Props */
const props = defineProps<{
  /** 当前播放模式 */
  modelValue: PlayMode
}>()

/** Emits */
const emit = defineEmits<{
  'update:modelValue': [value: PlayMode]
}>()

const styles = {
  ...controlStyles,
}

/** 模式配置 */
const modeOptions = [
  {
    value: PlayMode.AUTO_NEXT,
    label: '自动下一集',
    icon: 'mdi:skip-next',
  },
  {
    value: PlayMode.LOOP,
    label: '循环播放',
    icon: 'mdi:repeat',
  },
  {
    value: PlayMode.STOP,
    label: '播完停止',
    icon: 'mdi:stop',
  },
]

const menuVisible = shallowRef(false)
const buttonRef = ref<HTMLElement>()

/** 当前模式 */
const currentMode = computed(() => props.modelValue)

/** 当前模式图标 */
const currentModeIcon = computed(() => {
  const mode = modeOptions.find(m => m.value === currentMode.value)
  return mode?.icon ?? 'mdi:skip-next'
})

/** 当前模式名称 */
const currentModeName = computed(() => {
  const mode = modeOptions.find(m => m.value === currentMode.value)
  return mode?.label ?? '自动下一集'
})

/** 提示文本 */
const playModeTip = computed(() => {
  return `播放模式: ${currentModeName.value}`
})

/** 切换菜单显示 */
function toggleMenu() {
  menuVisible.value = !menuVisible.value
}

/** 处理模式变化 */
function handleModeChange(mode: PlayMode) {
  emit('update:modelValue', mode)
  menuVisible.value = false
}
</script>
