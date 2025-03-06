debugInfo.bootstrapInfo();

import globToRegex from "glob-to-regexp";
import ROUTE_MATCH from "./constants/route.match";
import HomePage from "./pages/home/index";
import { videoPage } from "./pages/video";
import { checkUserAgent } from "./utils/checkUserAgent";
import { debugInfo } from "./utils/debugInfo";
import "./styles/theme.css";

checkUserAgent();

const routeMatch = [
	{
		match: ROUTE_MATCH.HOME,
		exec: () => new HomePage(),
	},
	{
		match: ROUTE_MATCH.VIDEO,
		exec: () => videoPage(),
	},
];
const main = () => {
	for (const route of routeMatch) {
		if (globToRegex(route.match).test(window.location.href)) {
			route.exec();
		}
	}
};

if (
	document.readyState === "complete" ||
	document.readyState === "interactive"
) {
	main();
} else {
	window.addEventListener("DOMContentLoaded", main);
}
