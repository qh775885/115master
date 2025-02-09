import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey from 'vite-plugin-monkey';

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
        include: ['https://115.com/*', 'https://dl.115cdn.net/fuckkk/*'],
        exclude: ['https://*.115.com/bridge*', 'https://*.115.com/static*'],
        // 自动允许脚本跨域访问的域名
        connect: ['115.com', 'webapi.115.com', 'proapi.115.com', 'subtitlecat.com', 'dl.115cdn.net', 'v.anxia.com'],
        require: ['https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js'],
        downloadURL: 'https://github.com/cbingb666/115master/releases/latest/download/115master.user.js',
        updateURL: 'https://github.com/cbingb666/115master/releases/latest/download/115master.meta.js'
      },

      build: {
        fileName: '115master.user.js',
        metaFileName: '115master.meta.js',
        externalGlobals: {
          // vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
          // hls: cdn.jsdelivr('Hls', 'dist/hls.min.js'),
        },
      },
    }),
  ],
});
