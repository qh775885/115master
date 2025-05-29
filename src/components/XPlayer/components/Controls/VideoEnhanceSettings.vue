<template>
    <div class="card card-sm bg-neutral-800 flex-1">
        <div class="card-body">
            <div class="flex justify-between items-center mb-2">
                <h3 class="card-title">色彩调整</h3>
                <button
                    class="btn btn-xs btn-circle btn-ghost"
                    @click="videoEnhance.reset"
                    title="重置"
                >
                    <Icon :icon="ICON_RESTART" class="size-6" />
                </button>
            </div>
            <div>
                <!-- 亮度 -->
                <fieldset class="fieldset">
                    <legend class="fieldset-legend w-full">亮度 <span class="badge badge-sm">{{ videoEnhance.brightness.value }}</span></legend>
                    <input
                        type="range"
                        class="range range-xs range-primary [--range-fill:0] w-full"
                        min="-100"
                        max="100"
                        step="1"
                        v-model.number="videoEnhance.brightness.value"
                    />
                </fieldset>
                
                <!-- 对比度 -->
                <fieldset class="fieldset">
                    <legend class="fieldset-legend w-full">对比度 <span class="badge badge-sm">{{ videoEnhance.contrast.value }}</span></legend>
                    <input
                        type="range"
                        class="range range-xs range-primary [--range-fill:0] w-full"
                        min="-100"
                        max="100"
                        step="1"
                        v-model.number="videoEnhance.contrast.value"
                    />
                </fieldset>
                
                <!-- 饱和度 -->
                <fieldset class="fieldset">
                    <legend class="fieldset-legend w-full">饱和度 <span class="badge badge-sm">{{ videoEnhance.saturation.value }}</span></legend>
                    <input
                        type="range"
                        class="range range-xs range-primary [--range-fill:0] w-full"
                        min="-100"
                        max="100"
                        step="1"
                        v-model.number="videoEnhance.saturation.value"
                    />
                </fieldset>
                
                <!-- 色温 -->
                <fieldset class="fieldset">
                    <legend class="fieldset-legend w-full">色温 <span class="badge badge-sm">{{ videoEnhance.colorTemp.value }}</span></legend>
                    <input
                        type="range"
                        class="range range-xs range-primary [--range-fill:0] w-full"
                        min="-100"
                        max="100"
                        step="1"
                        v-model.number="videoEnhance.colorTemp.value"
                    />
                </fieldset>

                <!-- 色调 -->
                <fieldset class="fieldset">
                    <legend class="fieldset-legend w-full">色调 <span class="badge badge-sm">{{ videoEnhance.hue.value }}</span></legend>
                    <input
                        type="range"
                        class="range range-xs range-primary [--range-fill:0] w-full"
                        min="-100"
                        max="100"
                        step="1"
                        v-model.number="videoEnhance.hue.value"
                    />
                </fieldset>
                
                <!-- 锐度 -->
                <fieldset class="fieldset">
                    <legend class="fieldset-legend w-full">锐度 <span class="badge badge-sm">{{ videoEnhance.sharpness.value }}</span></legend>
                    <input
                        type="range"
                        class="range range-xs range-primary [--range-fill:0] w-full"
                        min="0"
                        max="100"
                        step="1"
                        v-model.number="videoEnhance.sharpness.value"
                    />
                </fieldset>

                <!-- 禁用HDR -->
                <fieldset class="fieldset">
                    <legend class="fieldset-legend w-full">禁用HDR</legend>
                    <input 
                        type="checkbox" 
                        class="toggle toggle-primary toggle-sm" 
                        v-model="videoEnhance.disabledHDR.value"
                    />
                </fieldset>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { usePlayerContext } from "../../hooks/usePlayerProvide";
import { ICON_RESTART } from "../../utils/icon";

const { videoEnhance } = usePlayerContext();
</script> 