import { GM_cookie } from "$";
import { createApp } from "vue";
import { DL_URL_115, NORMAL_URL_115 } from "../../constants/115";
import Video from "./index.vue";

const resetDocument = () => {
	document.body.style.backgroundColor = "#000";
	document.body.style.margin = "0";
	document.body.innerHTML = `<div id="app"></div>`;
	document.title = "";
};

export const setVideoCookie = (
	cookieDetail: Parameters<typeof GM_cookie.set>[0] & {
		sameSite: "no_restriction";
	},
) => {
	return new Promise((resolve, reject) => {
		const iframe = document.createElement("iframe");
		iframe.src = `${DL_URL_115}/video/token`;
		iframe.style.display = "none";
		iframe.onload = () => {
			iframe.contentWindow?.postMessage(cookieDetail, DL_URL_115);
		};

		window.addEventListener("message", (event) => {
			if (event.origin === DL_URL_115) {
				if (event.data) {
					reject(event.data);
				} else {
					resolve("success");
				}
				iframe.remove();
			}
		});
		document.body.appendChild(iframe);
	});
};

export const videoTokenPage = () => {
	window.addEventListener("message", (event) => {
		if (event.origin === NORMAL_URL_115) {
			GM_cookie.set(event.data, (error) => {
				window.parent.postMessage(error, NORMAL_URL_115);
			});
		}
	});
};

export const videoPage = () => {
	resetDocument();
	createApp(Video).mount("#app");
};
