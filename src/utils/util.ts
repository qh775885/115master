import { type WatchStopHandle, watchEffect } from "vue";

const wait = (checkFunc: () => boolean) => {
	return new Promise<void>((resolve) => {
		let stopOnFirst = false;

		let stopWatch: WatchStopHandle | undefined = undefined;
		stopWatch = watchEffect(() => {
			const flag = checkFunc();
			if (flag) {
				resolve();

				if (stopWatch) {
					stopWatch();
				} else {
					stopOnFirst = true;
				}
			}
		});

		if (stopOnFirst) {
			stopWatch();
		}
	});
};

export const util = {
	wait,
};
