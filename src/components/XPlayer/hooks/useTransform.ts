import { type CSSProperties, computed, shallowRef } from "vue";
import type { PlayerContext } from "./usePlayerProvide";

/**
 * 保持矩形旋转后的原始高度
 * @param width 宽度
 * @param height 高度
 * @param angle 旋转角度（度）
 * @returns 缩放比例
 */
const maintainRectangleHeight = (
	width: number,
	height: number,
	angle: number,
) => {
	// 将角度转换为弧度
	const radians = (angle * Math.PI) / 180;

	// 计算旋转后的新高度
	const newHeight =
		Math.abs(width * Math.sin(radians)) + Math.abs(height * Math.cos(radians));

	// 计算需要的缩放比例以保持原始高度
	const scale = height / newHeight;

	// 应用变换
	return scale;
};

// 画面转换
export const useTransform = (_ctx: PlayerContext) => {
	// 宽度比
	const WIDTH_RATIO = 16;
	// 高度比
	const HEIGHT_RATIO = 9;
	// 旋转角度
	const ROTATE_ANGLE = 90;
	// 最大旋转角度
	const MAX_ROTATE_ANGLE = 270;
	// 旋转角度
	const rotate = shallowRef(0);
	// 水平翻转
	const flipX = shallowRef(false);
	// 垂直翻转
	const flipY = shallowRef(false);
	// 缩放比例
	const scale = computed(() => {
		return maintainRectangleHeight(WIDTH_RATIO, HEIGHT_RATIO, rotate.value);
	});
	// 样式
	const style = computed((): CSSProperties => {
		const transforms = [
			`rotate(${rotate.value}deg)`,
			`scale(${scale.value * (flipX.value ? -1 : 1)}, ${scale.value * (flipY.value ? -1 : 1)})`,
			"translateZ(0)",
		];

		return {
			transform: transforms.join(" "),
		};
	});

	// 左旋转是否禁用
	const isLeftDisabled = computed(() => {
		// 使用严格相等确保在-270度时禁用
		return rotate.value === -MAX_ROTATE_ANGLE;
	});

	// 右旋转是否禁用
	const isRightDisabled = computed(() => {
		// 使用严格相等确保在270度时禁用
		return rotate.value === MAX_ROTATE_ANGLE;
	});

	// 左旋转
	const left = () => {
		// 如果已经达到最小角度，不执行操作
		if (rotate.value <= -MAX_ROTATE_ANGLE) return;
		// 计算新角度
		const newAngle = rotate.value - ROTATE_ANGLE;
		// 确保不超过最小角度
		rotate.value = Math.max(newAngle, -MAX_ROTATE_ANGLE);
	};

	// 右旋转
	const right = () => {
		// 如果已经达到最大角度，不执行操作
		if (rotate.value >= MAX_ROTATE_ANGLE) return;
		// 计算新角度
		const newAngle = rotate.value + ROTATE_ANGLE;
		// 确保不超过最大角度
		rotate.value = Math.min(newAngle, MAX_ROTATE_ANGLE);
	};

	// 正常
	const normal = () => {
		rotate.value = 0;
		flipX.value = false;
		flipY.value = false;
	};

	// 水平翻转
	const toggleFlipX = () => {
		flipX.value = !flipX.value;
	};

	// 垂直翻转
	const toggleFlipY = () => {
		flipY.value = !flipY.value;
	};

	return {
		rotate,
		flipX,
		flipY,
		left,
		right,
		normal,
		toggleFlipX,
		toggleFlipY,
		isLeftDisabled,
		isRightDisabled,
		transformStyle: style,
	};
};
