<template>
	<div
        :class="$style['control-header']" 
		@mouseenter="controls.setIsMouseInControls(true)"
		@mouseleave="controls.setIsMouseInControls(false)"
		>
		<div 
			:class="[
				$style['control-header__content'],
				{
					[$style['is-visible']]: controls.visible.value
				}
			]">
			<div :class="$style['control-header__left']">
				<div :class="$style['control-header__left-item']">
				</div>
			</div>
			<div :class="$style['control-header__right']">
				<div :class="$style['control-header__right-item']">
					<StatisticsButton />
					<PlaylistButton />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { usePlayerContext } from "../../hooks/usePlayerProvide";
import PlaylistButton from "./PlaylistButton.vue";
import StatisticsButton from "./StatisticsButton.vue";
const { controls } = usePlayerContext();
</script>

<style module>
.control-header {
	position: relative;
}
.control-header__content {
	display: flex;
	justify-content: space-between;
	align-items: center;
    padding: 24px 24px;
	transition: opacity 0.2s ease;
	opacity: 0;
	&.is-visible {
		opacity: 1;
	}
}
.control-header__right-item {
	display: flex;
	align-items: center;
	gap: 16px;
	button {
		background-color: transparent;
		border: none;
		padding: 0;
		border-radius: 50%;
		background-color: rgba(15, 15, 15, 0.7);
		backdrop-filter: blur(20px) saturate(180%);
		padding: 8px;
		cursor: pointer;
	}
}
</style>