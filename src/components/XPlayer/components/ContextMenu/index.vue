<template>
  <Popup
    :visible="contextMenu.visible.value"
    :x="contextMenu.position.value.x"
    :y="contextMenu.position.value.y"
    @update:visible="contextMenu.hide"
  >
    <ul :class="styles.container">
      <li
        v-for="item in contextMenu.menuItems"
        :key="item.id"
      >
        <a
          :class="styles.menuItem"
          @click="item.action"
        >
          <Icon
            v-if="item.icon"
            :icon="item.icon"
            :class="styles.icon"
          />
          <span>{{ item.label }}</span>
          <span v-if="item.actionKey" :class="styles.shortcuts">
            {{ shortcuts.getShortcutsTip(item.actionKey) }}
          </span>
        </a>
      </li>
    </ul>
  </Popup>

  <!-- 关于弹窗 -->
  <AboutPopup
    :visible="contextMenu.showAbout.value"
    @update:visible="(val: boolean) => contextMenu.showAbout.value = val"
  >
    <template #content>
      <slot name="aboutContent" />
    </template>
  </AboutPopup>

  <!-- 快捷键弹窗 -->
  <ShortcutsPopup
    :visible="contextMenu.showShortcuts.value"
    @update:visible="(val: boolean) => contextMenu.showShortcuts.value = val"
  />
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { clsx } from '../../../../utils/clsx'
import { usePlayerContext } from '../../hooks/usePlayerProvide'
import Popup from '../Popup/index.vue'
import ShortcutsPopup from '../Shortcuts/ShortcutsPopup.vue'
import AboutPopup from './AboutPopup.vue'

defineSlots<{
  aboutContent: () => void
}>()

const styles = clsx({
  container: 'menu w-40',
  menuItem: 'menu-item rounded-xl px-2',
  icon: 'size-5',
  shortcuts: 'ml-auto text-xs opacity-30',
})

const { contextMenu, shortcuts } = usePlayerContext()
</script>
