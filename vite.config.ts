import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey, { cdn } from 'vite-plugin-monkey';

const icons = {
  prod: 'https://115.com/favicon.ico',
  dev: 'https://vitejs.dev/logo.svg'
}

const isProd = process.env.NODE_ENV === 'production';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: '115Master',
        icon: isProd ? icons.prod : icons.dev,
        namespace: 'npm/vite-plugin-monkey',
        include: ['https://115.com/*'],
        exclude: ['https://*.115.com/bridge*', 'https://*.115.com/static*'],
        // 自动允许脚本跨域访问的域名
        connect: ['webapi.115.com','proapi.115.com','subtitlecat.com'],
      },
      build: {
        externalGlobals: {
          // vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
          // hls: cdn.jsdelivr('Hls', 'dist/hls.min.js'),
        },
      },
    }),
  ],
});
