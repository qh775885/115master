<template>
	<button @click="pictureInPicture.toggle" v-if="pictureInPicture.isSupport">
		<Icon :svg="pictureInPicture.isPip.value ? PipExit : Pip" class="icon" />
	</button>
</template>

<script setup lang="ts">
import Pip from "@material-symbols/svg-400/rounded/pip.svg?component";
import PipExit from "@material-symbols/svg-400/rounded/pip_exit.svg?component";
import Icon from "../../../../components/Icon/index.vue";
import { usePlayerContext } from "../../hooks/usePlayerProvide";
const { pictureInPicture } = usePlayerContext();
</script>
