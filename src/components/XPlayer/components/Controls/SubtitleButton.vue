<template>
	<button
		ref="buttonRef"
		:class="[styles.btn.root]"
		:data-tip="`${subtitles.list.value?.length ? '字幕(C)' : '未找到字幕'}`"
		:disabled="subtitles.loading.value || !subtitles.ready.value || subtitles.list.value?.length === 0"
		@click="toggleMenu"
	>
		<!-- loading -->
		<Icon 
			v-if="subtitles.loading.value || !subtitles.ready.value"
			:class="[styles.btn.icon]"
			:icon="ICON_LOADING"
		/>
		<!-- found 字幕 -->
		<Icon 
			:icon="subtitles.current.value ? ICON_SUBTITLES : ICON_SUBTITLES_OFF"
			:class="[styles.btn.icon]"
			:disabled="subtitles.list.value?.length === 0"
		/>

		<Popup
			v-model:visible="menuVisible"
			:trigger="buttonRef"
			placement="top"
		>
			<ul :class="[styles.menu.root]">
				<li
					v-for="item in menuItems"
					:key="item.id"
				>
					<a
						:class="[
							styles.menu.a,
							{
								[styles.menu.active]: item.value?.url === subtitles.current.value?.url
							}
						]"
						@click="handleSubtitleSelect(item.value)"
					>
						<Icon v-if="item.icon" :class="[styles.menu.icon]" :icon="item.icon"></Icon>
						<span :class="[styles.menu.label]">{{ item.label }}</span>
						<span :class="[styles.menu.desc]">{{ item.value?.source }}</span>
					</a>
				</li>
			</ul>
		</Popup>
	</button>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { computed, shallowRef } from "vue";
import { usePlayerContext } from "../../hooks/usePlayerProvide";
import { controlStyles } from "../../styles/common";
import type { Subtitle } from "../../types";
import {
	ICON_LOADING,
	ICON_SUBTITLES,
	ICON_SUBTITLES_OFF,
} from "../../utils/icon";
import Popup from "../Popup/index.vue";

const styles = {
	menu: {
		...controlStyles.menu,
		a: [controlStyles.menu.a, "py-2"],
	},
	btn: controlStyles.btn,
};

const { subtitles, playerCore } = usePlayerContext();
const menuVisible = shallowRef(false);
const buttonRef = shallowRef<HTMLElement>();

const menuItems = computed(() => {
	return [
		{
			id: -1,
			label: "关闭字幕",
			value: null,
			icon: ICON_SUBTITLES_OFF,
		},
		...(subtitles.list.value ?? []).map((item) => ({
			id: item.url,
			label: item.label,
			value: item,
			icon: undefined,
		})),
	];
});

const toggleMenu = () => {
	menuVisible.value = !menuVisible.value;
};

const handleSubtitleSelect = (subtitle: Subtitle | null) => {
	menuVisible.value = false;
	subtitles.change(subtitle);
};
</script>