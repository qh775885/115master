import { GM_addElement } from "$";
import { createApp } from "vue";
import Video from "./index.vue";
import "material-symbols/rounded.css";

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

	// GM_addElement("link", {
	// 	rel: "stylesheet",
	// 	href: "https://cdn.jsdelivr.net/npm/material-symbols@0.28.2/rounded.css",
	// });
};

export const videoPage = () => {
	resetDocument();
	createApp(Video).mount("#app");
};
