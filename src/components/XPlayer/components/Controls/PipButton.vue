<template>
	<button 
		v-if="pictureInPicture.isSupport"
		:title="pictureInPicture.isPip.value ? '退出画中画(P)' : '画中画(P)'"
		@click="pictureInPicture.toggle"
		:disabled="playerCore?.type === PlayerCoreType.AvPlayer"
	>
		<Icon :svg="pictureInPicture.isPip.value ? PipExit : Pip" class="icon" />
	</button>
</template>

<script setup lang="ts">
import Pip from "@material-symbols/svg-400/rounded/pip.svg?component";
import PipExit from "@material-symbols/svg-400/rounded/pip_exit.svg?component";
import Icon from "../../../../components/Icon/index.vue";
import { PlayerCoreType } from "../../hooks/playerCore/types";
import { usePlayerContext } from "../../hooks/usePlayerProvide";

const { pictureInPicture, playerCore } = usePlayerContext();
</script>