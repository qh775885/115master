# 115Master

115Master 是一个 115 网盘的 Tampermonkey 脚本，旨在提升 `115网盘` 的浏览体验。

## 功能

### 文件列表

- 📷 预览视频缩略图
- 📄 文件列表点击鼠标中键打开文件夹新标签页
- ⌚ Tab 标题上显示当前目录路径
- 📥 支持文件下载（仅支持单文件）

### 播放器

### 播放器功能

- 🎨 `Ultra原画`
- 👁 视频缩略图
- 🤖 在线外挂字幕
- 🎉 支持一键唤起 [IINA](https://iina.io/) 播放
- 🖼 画中画
- ⌚ 播放列表展示
- ⌨️ [快捷键](#播放器快捷键)
- 🎨 视频调色

### 播放器核心

集成3种播放器核心，根据视频格式自动启用最优播放器。

- [Native](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/video) 播放器，为 `Ultra画质` 下提供 `.mp4` 等其他封装格式播放，兼容性取决于浏览器。

- [AvPlayer](https://zhaohappy.github.io/libmedia/docs/guide/player) 播放器，为 `Ultra画质` 下提供 `.mkv` 格式播放，需要支持 `webassembly` 与 `webcodecs` 的浏览器。

- [Hls.js](https://github.com/video-dev/hls.js) 播放器，为非 `Ultra画质` 下提供 `.m3u8` 格式播放, 兼容性最高。

## 开发

### 环境

- Node.js v20.x.x
- pnpm v9.x.x

### 安装依赖

```sh
pnpm install
```

### 运行开发环境

```bash
pnpm dev
```

### 构建

```bash
pnpm build
```

## 使用安装

### 运行环境基准

- 浏览器：Chrome 130+ 或 115Browser 35.x.x
- 浏览器扩展：Tampermonkey v5.3.3+
- 网络环境：需要科学上网才能使用完整功能

### 安装步骤

1. 安装 [Tampermonkey](https://www.tampermonkey.net/)。

2. 开启 [浏览器扩展开发者模式](https://www.tampermonkey.net/faq.php#Q209)。

3. 一键安装 [115master.user.js](https://github.com/cbingb666/115master/releases/latest/download/115master.user.js) 安装 【115Master】脚本。

4. 油猴面板勾选启动 【115Master】脚本，刷新页面开始使用。

5. 安装完成后如果没有看到文件列表中有【master播放】的按钮，请检查有没有其他脚本导致冲突或重启浏览器。

<img width="329" alt="image" src="https://github.com/user-attachments/assets/189ac578-0592-43bd-ab75-b62cbe6f5170" />

👆上面一通操作后，还是无法使用的话请进入 [TG群](https://t.me/+EzfL2xXhlOA4ZjBh) 反馈或提交 [Issues](https://github.com/cbingb666/115master/issues)，请说明你的详情操作！

## 播放器快捷键

| 快捷键    | 替代键  | 功能          | 备注                       |
| --------- | ------- | ------------- | -------------------------- |
| `Space`   | -       | 播放/暂停     | -                          |
| ` ← / → ` | `A / D` | 快退/快进     | 长按 → 15 倍速播放         |
| ` ↑ / ↓ ` | `W / S` | 倍速          | 长按在 1-15 倍之间快速调整 |
| ` - / = ` | -       | 音量          | -                          |
| `0-9`     | -       | 跳转进度      | -                          |
| `M`       | -       | 切换静音      | -                          |
| `C`       | -       | 切换字幕开关  | -                          |
| `F`       | -       | 切换全屏      | -                          |
| `P`       | -       | 切换画中画    | -                          |
| `B`       | -       | 切换播放列表  | -                          |
| ` [ / ] ` | `L / R` | 向左/向右旋转 | -                          |
| ` \ `     | -       | 重置旋转      | -                          |
| `H`       | -       | 水平翻转      | -                          |
| `J`       | -       | 垂直翻转      | -                          |

## 常见问题

### Q: 为什么会弹出提示删除 User-Agent Switcher and Manager 插件？

    A: 因为现在不需要修改 User-Agent 了，所以请删除这个插件并重启浏览器。

### Q: 为什么我没有安装过 User-Agent Switcher and Manager 插件，也会提示删除？

    A: 因为你是 【115Browser浏览器v27.x.x】 版本，请升级浏览器的版本。


### Q: 为什么有些视频没有字幕？

    A: 因为现在只支持了绝大部分番号的识别。

## 鸣谢

- [@zhaohappy](https://github.com/zhaohappy) 提供了 [AvPlayer](https://zhaohappy.github.io/libmedia/docs/guide/player) 
