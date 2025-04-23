<template>
	<button 
        :class="$style['settings-button']"
        ref="buttonRef"
		title="设置"
		@click="toggleMenu"
	>
		<Icon :svg="SettingsSvg" class="icon" />
        <Popup
            :class="$style['settings-popup']"
            v-model:visible="menuVisible"
            :triggerRef="buttonRef"
            placement="top"
        >
            <div :class="$style['settings-content']">
                <div :class="$style['grid-layout']">
                    <!-- 左列 -->
                    <div :class="$style['column']">
                        <!-- 旋转与翻转 -->
                        <div :class="$style['chunk']">
                            <div :class="$style['chunk-header']">
                                <span>旋转与翻转</span>
                            </div>
                            <div :class="$style['chunk-content']">
                                <div :class="$style['transform-controls']">
                                    <!-- 旋转控制 -->
                                    <div :class="$style['transform-section']">
                                        <div :class="$style['transform-label']">
                                            <span>旋转</span>
                                            <span :class="$style['angle-display']">{{ transform.rotate.value }}°</span>
                                        </div>
                                        <div :class="$style['control-buttons']">
                                            <button 
                                                :class="$style['control-button']" 
                                                :disabled="transform.rotate.value === -270"
                                                @click="transform.left"
                                            >
                                                <Icon :svg="RotateLeftSvg" class="icon icon-sm" />
                                            </button>
                                            <button :class="$style['control-button']" @click="transform.normal">
                                                <Icon :svg="BlockSvg" class="icon icon-sm" />
                                            </button>
                                            <button 
                                                :class="$style['control-button']" 
                                                :disabled="transform.rotate.value === 270"
                                                @click="transform.right"
                                            >
                                                <Icon :svg="RotateRightSvg" class="icon icon-sm" />
                                            </button>
                                        </div>
                                    </div>

                                    <!-- 翻转控制 -->
                                    <div :class="$style['transform-section']">
                                        <div :class="$style['transform-label']">
                                            <span>翻转</span>
                                            <div :class="$style['flip-status']">
                                                <template v-if="transform.flipX.value || transform.flipY.value">
                                                    {{ transform.flipX.value ? '水平' : '' }}
                                                    {{ transform.flipY.value ? '垂直' : '' }}
                                                </template>
                                                <template v-else>正常</template>
                                            </div>
                                        </div>
                                        <div :class="$style['flip-buttons']">
                                            <button 
                                                :class="[$style['flip-button'], { [$style.active]: transform.flipX.value }]" 
                                                @click="transform.toggleFlipX"
                                            >
                                                <div :class="$style['item-icon']">
                                                    <Icon :svg="FlipSvg" class="icon icon-sm" style="transform: rotate(90deg);" />
                                                </div>
                                                <span>水平</span>
                                            </button>
                                            <button 
                                                :class="[$style['flip-button'], { [$style.active]: transform.flipY.value }]" 
                                                @click="transform.toggleFlipY"
                                            >
                                                <div :class="$style['item-icon']">
                                                    <Icon :svg="FlipSvg" class="icon icon-sm" />
                                                </div>
                                                <span>垂直</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 预览图设置 -->
                        <div :class="$style['chunk']">
                            <div :class="$style['chunk-header']">
                                <span>预览图</span>
                            </div>
                            <div :class="$style['chunk-content']">
                                <!-- 自动缓冲 -->
                                <div :class="$style['button-group']">
                                    <button 
                                        :class="[$style['option-button'], { [$style.active]: thumbnailSettings.autoLoadThumbnails.value }]" 
                                        @click="thumbnailSettings.toggleAutoLoad"
                                    >
                                        <div :class="$style['item-icon']">
                                            <Icon :svg="AutorenewSvg" class="icon icon-sm" />
                                        </div>
                                        <span>自动缓冲</span>
                                    </button>
                                  
                                </div>
                                
                                <!-- 采样间隔设置 -->
                                <div :class="$style['sampling-interval']">
                                    <div :class="$style['sampling-label']">采样间隔 (S)</div>
                                    <div :class="$style['sampling-options']">
                                        <button
                                            v-for="interval in samplingIntervals"
                                            :key="interval"
                                            :class="[$style['interval-option'], { 
                                                [$style.active]: thumbnailSettings.samplingInterval.value === interval 
                                            }]"
                                            @click="thumbnailSettings.setSamplingInterval(interval)"
                                        >
                                            {{ interval }}
                                        </button>
                                    </div>
                                </div>
                                
                                <div :class="$style['tip-text']">刷新后生效</div>
                            </div>
                        </div>
                    </div>

                    <!-- 右列 -->
                    <div :class="$style['column']">
                        <!-- 色彩调整 -->
                        <div :class="$style['chunk']">
                            <div :class="$style['chunk-header']">
                                <span>色彩调整</span>
                                <button
                                    :class="$style['reset-button']"
                                    @click="videoEnhance.reset"
                                    title="重置"
                                >
                                    <Icon :svg="RestartAltSvg" class="icon icon-sm" />
                                </button>
                            </div>
                            <div :class="$style['chunk-content']">
                                
                                <!-- 亮度 -->
                                <div :class="$style['slider-item']">
                                    <div :class="$style['slider-label']">
                                        <span>亮度</span>
                                        <span :class="$style['slider-value']">{{ videoEnhance.brightness.value }}</span>
                                    </div>
                                    <input
                                        type="range"
                                        :class="$style['slider']"
                                        min="-100"
                                        max="100"
                                        step="1"
                                        v-model.number="videoEnhance.brightness.value"
                                    />
                                </div>
                                
                                <!-- 对比度 -->
                                <div :class="$style['slider-item']">
                                    <div :class="$style['slider-label']">
                                        <span>对比度</span>
                                        <span :class="$style['slider-value']">{{ videoEnhance.contrast.value }}</span>
                                    </div>
                                    <input
                                        type="range"
                                        :class="$style['slider']"
                                        min="-100"
                                        max="100"
                                        step="1"
                                        v-model.number="videoEnhance.contrast.value"
                                    />
                                </div>
                                
                                <!-- 饱和度 -->
                                <div :class="$style['slider-item']">
                                    <div :class="$style['slider-label']">
                                        <span>饱和度</span>
                                        <span :class="$style['slider-value']">{{ videoEnhance.saturation.value }}</span>
                                    </div>
                                    <input
                                        type="range"
                                        :class="$style['slider']"
                                        min="-100"
                                        max="100"
                                        step="1"
                                        v-model.number="videoEnhance.saturation.value"
                                />
                                </div>
                                
                                <!-- 色温 -->
                                <div :class="$style['slider-item']">
                                    <div :class="$style['slider-label']">
                                        <span>色温</span>
                                        <span :class="$style['slider-value']">{{ videoEnhance.colorTemp.value }}</span>
                                    </div>
                                    <input
                                        type="range"
                                        :class="$style['slider']"
                                        min="-100"
                                        max="100"
                                        step="1"
                                        v-model.number="videoEnhance.colorTemp.value"
                                    />
                                </div>

                                <!-- 色调 -->
                                <div :class="$style['slider-item']">
                                    <div :class="$style['slider-label']">
                                        <span>色调</span>
                                        <span :class="$style['slider-value']">{{ videoEnhance.hue.value }}</span>
                                    </div>
                                    <input
                                        type="range"
                                        :class="$style['slider']"
                                        min="-100"
                                        max="100"
                                        step="1"
                                        v-model.number="videoEnhance.hue.value"
                                    />
                                </div>
                                
                                <!-- 锐度 -->
                                <div :class="$style['slider-item']">
                                    <div :class="$style['slider-label']">
                                        <span>锐度</span>
                                        <span :class="$style['slider-value']">{{ videoEnhance.sharpness.value }}</span>
                                    </div>
                                    <input
                                        type="range"
                                        :class="$style['slider']"
                                        min="0"
                                        max="100"
                                        step="1"
                                        v-model.number="videoEnhance.sharpness.value"
                                    />
                                </div>

                                <!-- 禁用HDR -->
                                <div :class="$style['slider-item']">
                                    <div :class="$style['slider-label']">
                                        <span>禁用HDR</span>
                                        <div :class="$style['toggle-switch']" @click="videoEnhance.disabledHDR.value = !videoEnhance.disabledHDR.value">
                                            <div :class="[$style['toggle-track'], { [$style.active]: videoEnhance.disabledHDR.value }]">
                                                <div :class="[$style['toggle-thumb'], { [$style.active]: videoEnhance.disabledHDR.value }]"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Popup>
	</button>
</template>

<script setup lang="ts">
import AutorenewSvg from "@material-symbols/svg-400/rounded/autorenew.svg?component";
import BlockSvg from "@material-symbols/svg-400/rounded/block.svg?component";
import FlipSvg from "@material-symbols/svg-400/rounded/flip.svg?component";
import RestartAltSvg from "@material-symbols/svg-400/rounded/restart_alt.svg?component";
import RotateLeftSvg from "@material-symbols/svg-400/rounded/rotate_left.svg?component";
import RotateRightSvg from "@material-symbols/svg-400/rounded/rotate_right.svg?component";
import SettingsSvg from "@material-symbols/svg-400/rounded/settings.svg?component";
import { shallowRef } from "vue";
import Icon from "../../../../components/Icon/index.vue";
import { usePlayerContext } from "../../hooks/usePlayerProvide";
import Popup from "../Popup/index.vue";
const { transform, thumbnailSettings, videoEnhance } = usePlayerContext();

// 采样间隔选项
const samplingIntervals = [30, 60, 120];
const buttonRef = shallowRef<HTMLElement>();
const menuVisible = shallowRef(false);
const toggleMenu = () => {
	menuVisible.value = !menuVisible.value;
};
</script>

<style module>
.settings-button {
    position: relative;
    display: inline-block;
}

.settings-popup {
    min-width: 520px;
    padding: 12px;
    border-radius: 12px;
}

.settings-content {
    display: flex;
    flex-direction: column;
}

.grid-layout {
    display: flex;
    gap: 16px;
}

.column {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.chunk {
    display: flex;
    flex-direction: column;
    padding: 4px 0;
    margin-bottom: 12px;
    background: rgba(55,55,55,.5);
    border-radius: 8px;
}

.chunk-header {
    display: flex;
    align-items: center;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    padding: 6px 12px;
    justify-content: space-between;
    letter-spacing: 0.2px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.angle-display, .flip-status {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    background: rgba(255, 255, 255, 0.08);
    padding: 2px 6px;
    border-radius: 10px;
    min-width: 32px;
    text-align: center;
}

.chunk-content {
    padding: 10px 12px;
}

.button-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.tip-text {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 6px;
    text-align: center;
}

.option-button {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 6px 10px;
    border-radius: 8px;
    transition: all 0.2s;
    font-size: 12px;
    background: rgba(255, 255, 255, 0.04);
    border: none;
    color: white;
    text-align: left;
    width: 100%;

    &:hover {
        background: rgba(255, 255, 255, 0.08);
    }
    
    &.active {
        color: var(--x-player-color-primary, #007aff);
        background: rgba(0, 122, 255, 0.15);
        font-weight: 500;
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        pointer-events: none;
    }

    span {
        margin-left: 8px;
    }
}

.transform-controls {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.transform-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.transform-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
}

.item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
}

.control-buttons {
    display: flex;
    justify-content: space-between;
    gap: 8px;
}

.control-button {
    flex: 1;
    background: rgba(255, 255, 255, 0.04);
    border: none;
    color: white;
    padding: 7px 0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background: rgba(255, 255, 255, 0.08);
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        pointer-events: none;
    }
}

.flip-buttons {
    display: flex;
    gap: 8px;
}

.flip-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 6px 10px;
    border-radius: 8px;
    transition: all 0.2s;
    font-size: 12px;
    background: rgba(255, 255, 255, 0.04);
    border: none;
    color: white;
    
    &:hover {
        background: rgba(255, 255, 255, 0.08);
    }
    
    &.active {
        color: var(--x-player-color-primary, #007aff);
        background: rgba(0, 122, 255, 0.15);
        font-weight: 500;
    }
    
    span {
        margin-left: 4px;
    }
}

.reset-button {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    padding: 3px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
        color: rgba(255, 255, 255, 0.8);
        background: rgba(255, 255, 255, 0.08);
    }
}

.slider-item {
    margin-bottom: 10px;
    
    &:last-child {
        margin-bottom: 0;
    }
}

.slider-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 8px;
}

.slider-value {
    background: rgba(255, 255, 255, 0.08);
    padding: 1px 4px;
    border-radius: 4px;
    min-width: 24px;
    text-align: center;
    font-size: 11px;
}

.slider {
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: rgba(255, 255, 255, 0.15);
    outline: none;
    border-radius: 2px;
    cursor: pointer;

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--x-player-color-primary, #007aff);
        cursor: pointer;
    }

    &::-moz-range-thumb {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--x-player-color-primary, #007aff);
        cursor: pointer;
        border: none;
    }

    &:hover::-webkit-slider-thumb {
        box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.3);
    }

    &:hover::-moz-range-thumb {
        box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.3);
    }
}

.toggle-switch {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.toggle-track {
    position: relative;
    width: 42px;
    height: 22px;
    background: #505050;
    border-radius: 22px;
    transition: background 0.2s;
    
    &.active {
        background: #0078FF;
    }
}

.toggle-thumb {
    position: absolute;
    top: 1px;
    left: 1px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transition: left 0.2s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    
    &.active {
        left: calc(100% - 21px);
    }
}

.sampling-interval {
    margin-top: 12px;
}

.sampling-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 6px;
}

.sampling-options {
    display: flex;
    gap: 8px;
}

.interval-option {
    flex: 1;
    padding: 5px 0;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.04);
    border: none;
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        background: rgba(255, 255, 255, 0.08);
    }
    
    &.active {
        color: var(--x-player-color-primary, #007aff);
        background: rgba(0, 122, 255, 0.15);
        font-weight: 500;
    }
}
</style>