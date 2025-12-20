<template>
  <button
    ref="buttonRef"
    :class="[styles.btn.root]"
    data-tip="视频色彩"
    @click="toggleMenu"
  >
    <Icon
      class="transition-transform" :class="[
        styles.btn.icon,
        {
          'rotate-45': menuVisible,
        },
      ]"
      :icon="ICONS.ICON_COLOR_ADJUST"
    />
  </button>
  <Popup
    v-model:visible="menuVisible"
    :trigger="buttonRef"
    placement="top"
    :class="[styles.popup]"
  >
    <div class="card card-sm bg-neutral-800">
      <div class="card-body">
        <div class="flex justify-between items-center mb-2">
          <h3 class="card-title">
            视频色彩
          </h3>
          <button
            class="btn btn-xs btn-circle btn-ghost"
            title="重置"
            @click="resetAll"
          >
            <Icon :icon="ICONS.ICON_RESTART" class="size-6" />
          </button>
        </div>
        <div class="grid grid-rows-5 grid-flow-col gap-x-5 gap-y-2">
          <fieldset
            v-for="(value, key) in enhanceParams.values"
            :key="key"
            class="fieldset"
          >
            <legend class="fieldset-legend w-full">
              {{ ENHANCE_PARAMS_CONFIG[key].name }} <span class="badge badge-sm">{{ value }}</span>
            </legend>
            <input
              type="range"
              class="range range-xs range-primary [--range-fill:0] w-full"
              :value="value.value"
              :min="ENHANCE_PARAMS_CONFIG[key].min"
              :max="ENHANCE_PARAMS_CONFIG[key].max"
              :step="ENHANCE_PARAMS_CONFIG[key].step"
              @input="($event: Event) =>
                values[key].value = ($event.target as HTMLInputElement).valueAsNumber"
            >
          </fieldset>
          <!-- 禁用HDR -->
          <fieldset class="fieldset">
            <legend class="fieldset-legend w-full">
              禁用HDR
            </legend>
            <input
              v-model="videoEnhance.disabledHDR.value"
              type="checkbox"
              class="toggle toggle-primary toggle-sm"
            >
          </fieldset>
        </div>
      </div>
    </div>
  </Popup>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { shallowRef } from 'vue'
import { usePlayerContext } from '../../hooks/usePlayerProvide'
import { ICONS } from '../../index.const'
import { controlStyles } from '../../styles/common'
import Popup from '../Popup/index.vue'

const styles = {
  ...controlStyles,
  popup: 'select-none',
}

const buttonRef = shallowRef<HTMLElement>()
const menuVisible = shallowRef(false)
function toggleMenu() {
  menuVisible.value = !menuVisible.value
}

const { videoEnhance } = usePlayerContext()
const { enhanceParams, ENHANCE_PARAMS_CONFIG } = videoEnhance
const { values, resetAll } = enhanceParams
</script>
