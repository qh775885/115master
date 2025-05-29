<template>
	<button :class="[styles.btn.root, 'swap swap-rotate', { 'swap-active': !pictureInPicture.isPip.value }]"
		data-tip="画中画 (P)" @click="pictureInPicture.toggle" :disabled="playerCore?.type === PlayerCoreType.AvPlayer">
		<Icon :icon="ICON_PIP_EXIT" :class="[styles.btn.icon, 'swap-off']" />
		<Icon :icon="ICON_PIP" :class="[styles.btn.icon, 'swap-on']" />
	</button>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { PlayerCoreType } from "../../hooks/playerCore/types";
import { usePlayerContext } from "../../hooks/usePlayerProvide";
import { controlStyles } from "../../styles/common";
import { ICON_PIP, ICON_PIP_EXIT } from "../../utils/icon";

const styles = {
	...controlStyles,
};

const { pictureInPicture, playerCore } = usePlayerContext();
</script>