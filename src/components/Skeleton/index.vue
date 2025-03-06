<template>
    <div 
        class="skeleton" 
        :class="{
            circle,
            'skeleton-animated': animated,
            [`skeleton-${mode}`]: mode
        }"
        :style="{
            width,
            height,
            borderRadius
        }"
    >
        <slot></slot>
    </div>
</template>

<script lang="ts" setup>
withDefaults(
	defineProps<{
		width?: string;
		height?: string;
		circle?: boolean;
		borderRadius?: string;
		animated?: boolean;
		mode?: "dark" | "light";
	}>(),
	{
		width: "100%",
		height: "16px",
		circle: false,
		borderRadius: "4px",
		animated: true,
		mode: "dark",
	},
);
</script>

<style scoped>
.skeleton {
    display: inline-block;
    position: relative;
    overflow: hidden;
    vertical-align: middle;
    background: rgba(255, 255, 255, 0.1);
}

.skeleton-light {
    background: rgba(0, 0, 0, 0.1);
    .skeleton-animated::after {
        background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.1) 50%,
            rgba(0, 0, 0, 0) 100%
        );
    }
}

.skeleton.circle {
    border-radius: 50% !important;
}

.skeleton-animated::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.3) 50%,
        rgba(255, 255, 255, 0) 100%
    );
    animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(100%);
    }
}
</style> 