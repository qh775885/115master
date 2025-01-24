// import { createApp } from 'vue';
import './style.css';
// import App from './App.vue';
import { minimatch } from 'minimatch';
import ROUTE_MATCH from './constants/route.match';
import HomeScript from './scripts/Home';
import playerScript from './scripts/player';
import versionOutput from './utils/version-output';

versionOutput()

// createApp(App).mount(
//   (() => {
//     const app = document.createElement('div');
//     document.body.append(app);
//     return app;
//   })(),
// );


if (minimatch(window.location.href, ROUTE_MATCH.HOME)) {
  new HomeScript()
}

if (minimatch(window.location.href, ROUTE_MATCH.DPLAYER)) {
  new playerScript()
}