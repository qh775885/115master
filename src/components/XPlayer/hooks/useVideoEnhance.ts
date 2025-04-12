import { computed, shallowRef, toRef } from "vue";
import type { PlayerContext } from "./usePlayerProvide";

/**
 * 视频色彩调整设置
 */
export const useVideoEnhance = (ctx: PlayerContext) => {
	// 滤镜名称
	const filterName = "video-enhance";

	// 禁用HDR
	const disabledHDR = ctx.rootPropsVm.disabledHDR;

	// 锐度 0-100
	const sharpness = shallowRef(0);

	// 亮度 -100-100
	const brightness = shallowRef(0);

	// 对比度 -100-100
	const contrast = shallowRef(0);

	// 色温 -100(冷色)~100(暖色)
	const colorTemp = shallowRef(0);

	// 饱和度 -100-100
	const saturation = shallowRef(0);

	// 色调 -100-100（洋红-青色轴调整）
	const hue = shallowRef(0);

	// 判断是否启用滤镜（任何参数不为0则启用）
	const isEnabled = computed(() => {
		return (
			brightness.value !== 0 ||
			contrast.value !== 0 ||
			colorTemp.value !== 0 ||
			saturation.value !== 0 ||
			hue.value !== 0 ||
			sharpness.value !== 0
		);
	});

	// 获取亮度斜率
	const getBrightnessSlope = computed(() => {
		// 当亮度为0时，返回1（不改变颜色）
		if (brightness.value === 0) {
			return 1;
		}
		// 亮度调整范围：0.75-1.75（提高下限，让暗部不那么灰）
		return 1 + (brightness.value / 100) * 0.75;
	});

	// 获取亮度截距
	const getBrightnessIntercept = computed(() => {
		// 当亮度为0时，返回0（不改变颜色）
		if (brightness.value === 0) {
			return 0;
		}
		// 亮度调整范围：-0.15-0.15（缩小截距范围，减少灰色感）
		return (brightness.value / 100) * 0.15;
	});

	// 获取对比度斜率
	const getContrastSlope = computed(() => {
		// 当对比度为0时，返回1（不改变颜色）
		if (contrast.value === 0) {
			return 1;
		}
		// 对比度调整范围：0.5-1.5
		return 1 + (contrast.value / 100) * 0.5;
	});

	// 获取对比度截距
	const getContrastIntercept = computed(() => {
		// 当对比度为0时，返回0（不改变颜色）
		if (contrast.value === 0) {
			return 0;
		}
		// 对比度调整：需要保持平均亮度不变
		const slope = getContrastSlope.value;
		return (1 - slope) * 0.5;
	});

	// 获取饱和度矩阵
	const getSaturationMatrix = computed(() => {
		// 饱和度调整范围：0.5-1.5
		const saturationValue = 1 + (saturation.value / 100) * 0.5;

		// 当值为0时，返回单位矩阵（不对颜色做任何改变）
		if (saturation.value === 0) {
			return `1 0 0 0 0
					0 1 0 0 0
					0 0 1 0 0
					0 0 0 1 0`;
		}

		// 使用矩阵调整饱和度
		// 基于亮度权重: R=0.3, G=0.59, B=0.11
		const r = 0.3 * (1 - saturationValue);
		const g = 0.59 * (1 - saturationValue);
		const b = 0.11 * (1 - saturationValue);

		return `${r + saturationValue} ${g} ${b} 0 0
				${r} ${g + saturationValue} ${b} 0 0
				${r} ${g} ${b + saturationValue} 0 0
				0 0 0 1 0`;
	});

	// 获取色调变换矩阵（洋红-青色调整）
	const getHueMatrix = computed(() => {
		// 将-100到100的值归一化到合理的调整范围
		const value = hue.value / 100;

		// 当值为0时，返回单位矩阵（不对颜色做任何改变）
		if (value === 0) {
			return `1 0 0 0 0
					0 1 0 0 0
					0 0 1 0 0
					0 0 0 1 0`;
		}

		// 正值增加洋红（增加红蓝，减少绿色）
		// 负值增加青色（增加绿蓝，减少红色）

		// 如果是正值（偏洋红）
		if (value > 0) {
			// 增强红色和蓝色，减弱绿色
			const redGain = 1 + value * 0.15; // 红色增益，最大1.15
			const greenGain = 1 - value * 0.1; // 绿色减弱，最小0.9
			const blueGain = 1 + value * 0.05; // 蓝色轻微增益，最大1.05

			// 调整偏移以保持整体亮度
			const redOffset = value * 0.02;
			const greenOffset = -value * 0.02;
			const blueOffset = value * 0.01;

			return `${redGain} 0 0 0 ${redOffset}
					0 ${greenGain} 0 0 ${greenOffset}
					0 0 ${blueGain} 0 ${blueOffset}
					0 0 0 1 0`;
		}

		// 处理负值（偏青色）
		const absValue = Math.abs(value);

		// 减弱红色，增强绿色和蓝色
		const redGain = 1 - absValue * 0.12; // 红色减弱，最小0.88
		const greenGain = 1 + absValue * 0.1; // 绿色增强，最大1.1
		const blueGain = 1 + absValue * 0.1; // 蓝色增强，最大1.1

		// 调整偏移以保持整体亮度
		const redOffset = -absValue * 0.02;
		const greenOffset = absValue * 0.01;
		const blueOffset = absValue * 0.01;

		return `${redGain} 0 0 0 ${redOffset}
				0 ${greenGain} 0 0 ${greenOffset}
				0 0 ${blueGain} 0 ${blueOffset}
				0 0 0 1 0`;
	});

	// 获取色温矩阵
	const getColorTempMatrix = computed(() => {
		// 调整范围：-100~100
		const value = colorTemp.value / 100;

		// 当值为0时，返回单位矩阵（不对颜色做任何改变）
		if (value === 0) {
			return `1 0 0 0 0
					0 1 0 0 0
					0 0 1 0 0
					0 0 0 1 0`;
		}

		// 红色通道（控制暖色调）
		const r1 = 1 + value * 0.12; // 红色自身增益
		const r2 = value * 0.04; // 绿色对红色的贡献
		const r3 = value * -0.02; // 蓝色对红色的贡献
		const r4 = value * 0.05; // 整体红色偏移

		// 绿色通道（控制中性色调）
		const g1 = value * 0.02; // 红色对绿色的贡献
		const g2 = 1 + value * 0.06; // 绿色自身增益
		const g3 = value * -0.01; // 蓝色对绿色的贡献
		const g4 = value * 0.03; // 整体绿色偏移

		// 蓝色通道（控制冷色调）
		const b1 = value * -0.02; // 红色对蓝色的贡献
		const b2 = value * -0.03; // 绿色对蓝色的贡献
		const b3 = 1 - value * 0.08; // 蓝色自身增益（减少蓝色使画面更暖）
		const b4 = value * -0.02; // 整体蓝色偏移

		// 构建颜色矩阵（使用完整的4x5矩阵以获得更精确的控制）
		return `${r1} ${r2} ${r3} 0 ${r4}
				${g1} ${g2} ${g3} 0 ${g4}
				${b1} ${b2} ${b3} 0 ${b4}
				0 0 0 1 0`;
	});

	// 获取锐度内核矩阵
	const getSharpnessKernel = computed(() => {
		// 当锐度为0时，返回一个不改变图像的单位内核
		if (sharpness.value === 0) {
			return "0 0 0 0 1 0 0 0 0";
		}
		// 根据锐度值生成内核矩阵
		const center = 1 + (sharpness.value / 100) * 8; // 1-9范围
		const around = -(sharpness.value / 100) * 2; // 0-(-2)范围
		return `0 ${around} 0 ${around} ${center} ${around} 0 ${around} 0`;
	});

	// 渲染SVG滤镜组件
	const renderFilter = computed(() => {
		return `
			<svg width="0" height="0" style="position: absolute;">
				<defs>
					<!-- 基础亮度、对比度、锐化滤镜 -->
					<filter id="${filterName}" color-interpolation-filters="auto">
						<!-- 对比度 -->
						<feComponentTransfer result="contrast">
							<feFuncR type="linear" slope="${getContrastSlope.value}" intercept="${getContrastIntercept.value}" />
							<feFuncG type="linear" slope="${getContrastSlope.value}" intercept="${getContrastIntercept.value}" />
							<feFuncB type="linear" slope="${getContrastSlope.value}" intercept="${getContrastIntercept.value}" />
							<feFuncA type="identity" />
						</feComponentTransfer>
						
						<!-- 亮度 -->
						<feComponentTransfer result="brightness">
							<feFuncR type="linear" slope="${getBrightnessSlope.value}" intercept="${getBrightnessIntercept.value}" />
							<feFuncG type="linear" slope="${getBrightnessSlope.value}" intercept="${getBrightnessIntercept.value}" />
							<feFuncB type="linear" slope="${getBrightnessSlope.value}" intercept="${getBrightnessIntercept.value}" />
							<feFuncA type="identity" />
						</feComponentTransfer>
						
						<!-- 色调调整 -->
						<feColorMatrix
							result="hue"
							type="matrix"
							values="${getHueMatrix.value}"
						/>
						
						<!-- 色温调整 -->
						<feColorMatrix
							result="colortemp"
							type="matrix"
							values="${getColorTempMatrix.value}"
						/>
						
						<!-- 饱和度调整 -->
						<feColorMatrix
							result="saturation"
							type="matrix"
							values="${getSaturationMatrix.value}"
						/>

						<!-- 锐化 -->
						<feConvolveMatrix 
							result="sharpen"
							order="3"
							kernelMatrix="${getSharpnessKernel.value}"
							preserveAlpha="true"
						/>
					</filter>
				</defs>
			</svg>
		`;
	});

	// 获取滤镜CSS样式
	const getFilterStyle = computed(() => {
		// 如果所有参数都为默认值(0)，不应用任何滤镜样式
		if (!isEnabled.value) {
			if (disabledHDR.value) {
				return {
					filter: "brightness(1)",
					"webkit-filter": "brightness(1)",
				};
			}
			return {};
		}

		// 当有任何参数不为0时，返回滤镜样式
		return {
			filter: `url(#${filterName})`,
			"webkit-filter": `url(#${filterName})`,
		};
	});

	// 重置
	const reset = () => {
		sharpness.value = 0;
		brightness.value = 0;
		contrast.value = 0;
		colorTemp.value = 0;
		saturation.value = 0;
		hue.value = 0;
	};

	return {
		disabledHDR,
		sharpness,
		brightness,
		contrast,
		colorTemp,
		saturation,
		hue,
		filterName,
		renderFilter,
		getFilterStyle,
		reset,
	};
};
