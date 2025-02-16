debugInfo.bootstrapInfo();

import "./style.css";
import { minimatch } from "minimatch";
import ROUTE_MATCH from "./constants/route.match";
import HomePage from "./pages/home";
import PlayerPage from "./pages/player";
import { checkUserAgent } from "./utils/checkUserAgent";
import { debugInfo } from "./utils/debugInfo";

checkUserAgent();

const main = () => {
	if (minimatch(window.location.href, ROUTE_MATCH.HOME)) {
		new HomePage();
	}

	if (minimatch(window.location.href, ROUTE_MATCH.DPLAYER)) {
		new PlayerPage();
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
