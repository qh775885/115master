/**
 * 生成间隔数组
 * @param start 开始
 * @param end 结束
 * @param interval 间隔
 * @returns 间隔数组
 * @example
 * intervalArray(0, 10, 1) // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
 * intervalArray(0, 10, 2) // [0, 2, 4, 6, 8]
 * intervalArray(0, 10, 3) // [0, 3, 6, 9]
 */
export const intervalArray = (
	start: number,
	end: number,
	interval: number,
): number[] => {
	const diff = end - start;
	const array = [];
	for (let i = 0; i < diff; i += interval) {
		array.push(i);
	}
	return array;
};
