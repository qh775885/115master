import { onMounted, onUnmounted } from "vue";

export function useHotKey({
	togglePlay,
	skip,
	adjustVolume,
}: {
	togglePlay: () => void;
	skip: (amount: number) => void;
	adjustVolume: (delta: number) => void;
}) {
	// 热键处理
	const handleKeydown = (event: KeyboardEvent) => {
		// 忽略输入框的按键事件
		if (
			event.target instanceof HTMLInputElement ||
			event.target instanceof HTMLTextAreaElement
		) {
			return;
		}

		switch (event.code) {
			// 空格键
			case "Space":
				event.preventDefault();
				togglePlay();
				break;
			// 左箭头
			case "ArrowLeft":
				event.preventDefault();
				skip(-5);
				break;
			// 右箭头
			case "ArrowRight":
				event.preventDefault();
				skip(5);
				console.log("右箭头");
				break;
			// 上箭头
			case "ArrowUp":
				event.preventDefault();
				adjustVolume(5);
				break;
			// 下箭头
			case "ArrowDown":
				event.preventDefault();
				adjustVolume(-5);
				break;
		}
	};

	onMounted(() => {
		document.addEventListener("keydown", handleKeydown);
	});

	onUnmounted(() => {
		document.removeEventListener("keydown", handleKeydown);
	});
}
