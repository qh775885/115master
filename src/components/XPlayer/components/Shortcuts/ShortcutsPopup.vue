<template>
  <Popup :visible="visible" :class="styles.root" :mild="true" @update:visible="$emit('update:visible', $event)">
    <div :class="styles.container">
      <!-- 头部 -->
      <div :class="styles.header">
        <h3 :class="styles.title">
          <Icon :icon="ICONS.ICON_SHORTCUTS" class="size-6" />
          快捷键设置
        </h3>
        <button :class="styles.close" @click="$emit('update:visible', false)">
          <Icon :icon="ICONS.ICON_CLOSE" class="size-4" />
        </button>
      </div>
      <!-- 内容 -->
      <div :class="styles.content">
        <template v-for="group in groupedActions" :key="group.key">
          <div :class="styles.groupWrapper">
            <div :class="styles.groupTitle">
              <Icon :icon="group.icon" class="size-5" />
              <span>{{ group.name }}</span>
            </div>
            <div :class="styles.groupContent">
              <ShortcutsItem
                v-for="action in group.actions"
                :key="action.key"
                :action-key="action.key"
                :action="action.config"
                :key-bindings="action.keyBindings"
                @update:key-bindings="shortcuts.updateActionKeyBindings(action.key, $event)"
                @reset="shortcuts.resetActionKeyBindings(action.key)"
              />
            </div>
          </div>
        </template>
      </div>
      <!-- 底部 -->
      <div :class="styles.footer">
        <div :class="styles.actions">
          <button
            :class="styles.actionBtn" type="button" @click="handleImport"
          >
            <Icon :icon="ICONS.ICON_IMPORT" class="size-3.5" />
            <span>导入</span>
          </button>
          <button :class="styles.actionBtn" type="button" @click="handleExport">
            <Icon :icon="ICONS.ICON_EXPORT" class="size-3.5" />
            <span>导出</span>
          </button>
          <button
            v-if="hasCustomConfig"
            type="button"
            :class="[styles.actionBtn]"
            @click="handleResetAll"
          >
            <Icon :icon="ICONS.ICON_RESET_ALL" class="size-3.5" />
            重置全部
          </button>
        </div>
      </div>
    </div>
    <!-- 隐藏的文件输入 -->
    <input ref="fileInputRef" type="file" accept=".json" class="hidden" @change="handleFileChange">
  </Popup>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, shallowRef } from 'vue'
import { usePlayerContext } from '../../hooks/usePlayerProvide'
import { ICONS } from '../../index.const'
import Popup from '../Popup/index.vue'
import ShortcutsItem from './components/ShortcutsItem.vue'
import { ACTION_GROUPS, EXPORT_FILE_PREFIX } from './shortcuts.const'

defineProps<{ visible: boolean }>()
defineEmits<{ 'update:visible': [value: boolean] }>()

const styles = {
  root: [
    'top-1/2! left-1/2! -translate-x-1/2! -translate-y-1/2! w-2xl p-0!',
    '[--group-title-height:calc(var(--spacing)*10)]',
  ],
  container: 'relative flex flex-col overflow-hidden shadow-2xl max-h-[95vh]',
  header: [
    'flex items-center justify-between px-5',
    'py-4',
    'border-b border-base-content/5',
  ],
  title: 'flex items-center gap-2 text-base font-semibold text-base-content',
  close: [
    'btn btn-xs btn-ghost',
  ],
  content: 'flex-1 overflow-y-auto [&::-webkit-scrollbar-track]:mt-[calc(var(--header-height)+var(--group-title-height))]',
  groupWrapper: 'mb-0.5 last:mb-0',
  groupTitle: [
    'sticky top-2 z-2 flex items-center gap-2.5 text-sm font-bold px-4 mt-2 mx-5 h-[var(--group-title-height)]',
    'bg-neutral rounded-xl',
  ],
  groupContent: 'px-5 py-2',
  footer: 'flex items-center justify-end gap-3 px-5 py-3 bg-base-200/30 border-t border-base-content/5',
  actions: 'flex items-center gap-2',
  actionBtn: 'btn btn-sm gap-1.5 hover:scale-105 transition-transform',
}

const { shortcuts } = usePlayerContext()
const fileInputRef = shallowRef<HTMLInputElement>()
const actionList = computed(() => shortcuts.getActionList())
const hasCustomConfig = shortcuts.hasCustomConfig

/** 分组 Action */
const groupedActions = computed(() => {
  const actions = actionList.value

  /** 按照 ACTION_GROUPS 的顺序创建分组 */
  const groupOrder = Object.values(ACTION_GROUPS)
  const groupsMap = new Map<string, typeof actions>()

  /** 初始化所有分组 */
  for (const group of groupOrder) {
    groupsMap.set(group.key, [])
  }

  /** 将 actions 分配到对应的组 */
  for (const action of actions) {
    const group = action.config.group
    if (group && groupsMap.has(group.key)) {
      groupsMap.get(group.key)!.push(action)
    }
  }

  /** 返回有内容的分组（按顺序） */
  return groupOrder
    .map(group => ({
      key: group.key,
      name: group.name,
      icon: group.icon,
      actions: groupsMap.get(group.key) || [],
    }))
    .filter(group => group.actions.length > 0)
})

/**
 * 重置所有快捷键
 */
function handleResetAll() {
  if (confirm('确定重置所有快捷键？'))
    shortcuts.resetAllActionKeyBindings()
}

/**
 * 导入快捷键配置
 */
function handleImport() {
  fileInputRef.value?.click()
}

/**
 * 导出快捷键配置
 */
function handleExport() {
  const json = shortcuts.exportPreference()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${EXPORT_FILE_PREFIX}-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * 文件变化事件处理
 */
function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file)
    return

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    if (shortcuts.importPreference(content)) {
      alert('导入成功')
    }
    else {
      alert('导入失败：配置格式无效')
    }
  }
  reader.readAsText(file)
  input.value = ''
}
</script>
