<template>
    <button
        title="Statistics"
        @click="statistics.toggleVisible"
    >
        <Icon :svg="DebugSvg" />
    </button>
</template>

<script setup lang="ts">
import DebugSvg from "@material-symbols/svg-400/rounded/analytics.svg?component";
import Icon from "../../../Icon/index.vue";
import { usePlayerContext } from "../../hooks/usePlayerProvide";
const { statistics } = usePlayerContext();
</script>

<style module>
</style>