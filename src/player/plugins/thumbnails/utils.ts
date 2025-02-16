/**
 * 计算适合容器的视频尺寸
 * @param containerWidth 容器最大宽度
 * @param containerHeight 容器最大高度
 * @param videoWidth 视频原始宽度
 * @param videoHeight 视频原始高度
 * @returns 计算后的宽高
 */
export const calculateFitSize = (
	containerWidth: number,
	containerHeight: number,
	videoWidth: number,
	videoHeight: number,
): { width: number; height: number } => {
	// 计算视频宽高比
	const videoRatio = videoWidth / videoHeight;
	// 计算容器宽高比
	const containerRatio = containerWidth / containerHeight;

	let width: number;
	let height: number;

	if (videoRatio > containerRatio) {
		// 视频更宽,以容器宽度为基准
		width = containerWidth;
		height = width / videoRatio;
	} else {
		// 视频更高,以容器高度为基准
		height = containerHeight;
		width = height * videoRatio;
	}

	// 确保不超过容器尺寸
	if (width > containerWidth) {
		width = containerWidth;
		height = width / videoRatio;
	}
	if (height > containerHeight) {
		height = containerHeight;
		width = height * videoRatio;
	}

	return {
		width: Math.floor(width),
		height: Math.floor(height),
	};
};

/**
 * Parse second to time string
 * @param {Number} second
 * @return {String} 00:00 or 00:00:00
 */
export const secondToTime = (second: number) => {
	const secondRe = second || 0;
	if (
		secondRe === 0 ||
		secondRe === Number.POSITIVE_INFINITY ||
		secondRe.toString() === "NaN"
	) {
		return "00:00";
	}
	const add0 = (num: number) => (num < 10 ? `0${num}` : `${num}`);
	const hour = Math.floor(secondRe / 3600);
	const min = Math.floor((secondRe - hour * 3600) / 60);
	const sec = Math.floor(secondRe - hour * 3600 - min * 60);
	return (hour > 0 ? [hour, min, sec] : [min, sec]).map(add0).join(":");
};
