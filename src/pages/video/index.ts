import { GM_addElement } from "$";
import { createApp } from "vue";
import Video from "./index.vue";

const resetDocument = () => {
	document.body.style.backgroundColor = "#000";
	document.body.style.margin = "0";
	document.body.innerHTML = `<div id="app"></div>`;
	document.title = "";

	GM_addElement("link", {
		id: "favicon",
		rel: "icon",
		href: "https://115.com/favicon.ico",
	});
};

export const videoPage = () => {
	resetDocument();
	createApp(Video).mount("#app");
};
