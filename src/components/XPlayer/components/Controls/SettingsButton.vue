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
                <!-- 预览图设置 -->
                <div :class="$style['chunk']">
                    <div :class="$style['chunk-header']">
                        <span>预览图</span>
                    </div>
                    <div :class="$style['chunk-content']">
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
                            <button 
                                :class="[$style['option-button'], { 
                                    [$style.active]: thumbnailSettings.superAutoBuffer.value
                                }]" 
                                :disabled="!thumbnailSettings.autoLoadThumbnails.value"
                                @click="thumbnailSettings.toggleSuperBuffer"
                            >
                                <div :class="$style['item-icon']">
                                    <Icon :svg="AllInclusiveSvg" class="icon icon-sm" />
                                </div>
                                <span>全量缓冲</span>
                            </button>
                        </div>
                        <div :class="$style['tip-text']">刷新后生效</div>
                    </div>
                </div>

                <!-- 分隔线 -->
                <div :class="$style.divider"></div>

                <!-- 旋转 -->
                <div :class="$style['chunk']">
                    <div :class="$style['chunk-header']">
                        <span>旋转</span>
                        <div :class="$style['angle-display']">
                            {{ transform.rotate.value }}°
                        </div>
                    </div>
                    <div :class="$style['chunk-content']">
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
                </div>

                <!-- 分隔线 -->
                <div :class="$style.divider"></div>

                <!-- 翻转 -->
                <div :class="$style['chunk']">
                    <div :class="$style['chunk-header']">
                        <span>翻转</span>
                        <div :class="$style['flip-status']">
                            <template v-if="transform.flipX.value || transform.flipY.value">
                                {{ transform.flipX.value ? '水平' : '' }}
                                {{ transform.flipY.value ? '垂直' : '' }}
                            </template>
                            <template v-else>正常</template>
                        </div>
                    </div>
                    <div :class="$style['chunk-content']">
                        <div :class="$style['button-group']">
                            <button 
                                :class="[$style['option-button'], { [$style.active]: transform.flipX.value }]" 
                                @click="transform.toggleFlipX"
                            >
                                <div :class="$style['item-icon']">
                                    <Icon :svg="FlipSvg" class="icon icon-sm" style="transform: rotate(90deg);" />
                                </div>
                                <span>水平</span>
                            </button>
                            <button 
                                :class="[$style['option-button'], { [$style.active]: transform.flipY.value }]" 
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
        </Popup>
	</button>
</template>

<script setup lang="ts">
import AllInclusiveSvg from "@material-symbols/svg-400/rounded/all_inclusive.svg?component";
import AutorenewSvg from "@material-symbols/svg-400/rounded/autorenew.svg?component";
import BlockSvg from "@material-symbols/svg-400/rounded/block.svg?component";
import FlipSvg from "@material-symbols/svg-400/rounded/flip.svg?component";
import RotateLeftSvg from "@material-symbols/svg-400/rounded/rotate_left.svg?component";
import RotateRightSvg from "@material-symbols/svg-400/rounded/rotate_right.svg?component";
import SettingsSvg from "@material-symbols/svg-400/rounded/settings.svg?component";
import { shallowRef } from "vue";
import Icon from "../../../../components/Icon/index.vue";
import { usePlayerContext } from "../../hooks/usePlayerProvide";
import Popup from "../Popup/index.vue";
const { transform, thumbnailSettings } = usePlayerContext();

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
    min-width: 200px;
    padding: 12px;
    border-radius: 12px;
}

.settings-content {
    display: flex;
    flex-direction: column;
}

.chunk {
    display: flex;
    flex-direction: column;
    padding: 4px 0;
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
    padding: 6px 12px;
}

.divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
    margin: 0 12px;
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
</style>