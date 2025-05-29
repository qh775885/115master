<template>
    <button
        :class="[styles.btn.root]"
        title="Statistics"
        data-tip="统计"
        @click="statistics.toggleVisible"
    >
        <Icon :class="[styles.btn.icon]" :icon="ICON_STATISTICS" />
    </button>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { usePlayerContext } from "../../hooks/usePlayerProvide";
import { controlRightStyles } from "../../styles/common";
import { ICON_STATISTICS } from "../../utils/icon";

const styles = {
	btn: controlRightStyles.btn,
};

const { statistics } = usePlayerContext();
</script>