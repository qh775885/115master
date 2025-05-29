# 115Master

[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-v5.3.3%2B-blue?logo=tampermonkey&logoColor=white)](https://www.tampermonkey.net/)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/cbingb666/115master)

115Master 是一个 115 网盘的 Tampermonkey 脚本，旨在提升 `115网盘` 的浏览体验。

## 功能

### 播放器

### 播放器功能

- 🎨 `Ultra` 画质
- 👁 视频缩略图
- 🤖 在线外挂字幕
- 🎉 支持一键唤起 [IINA](https://iina.io/) 播放
- 🖼 画中画
- ⌚ 播放列表展示
- ⌨️ [快捷键](#播放器快捷键)
- 🎨 视频调色

### 文件列表

- 📷 预览视频缩略图
- 📄 文件列表点击鼠标中键打开文件夹新标签页
- ⌚ Tab 标题上显示当前目录路径
- 📥 支持文件下载（仅支持单文件）

## 使用安装

1. 选择浏览器 `Chrome 130+` 或 `115Browser 35+`。

2. 安装 [Tampermonkey v5.3.3+](https://www.tampermonkey.net/)。

3. 开启 [浏览器扩展开发者模式](https://www.tampermonkey.net/faq.php#Q209)。

4. 点击 [115master.user.js](https://github.com/cbingb666/115master/releases/latest/download/115master.user.js) 安装 【115Master】脚本。

5. 在油猴面板勾选启动 【115Master】脚本并刷新 115 主页开始使用。

6. 安装完成后如果没有看到文件列表中有【master播放】的按钮，请检查有没有其他脚本导致冲突或重启浏览器。

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

## 开发

环境基准

- Node.js v20+
- pnpm v9+

安装依赖

```sh
pnpm install
```

运行开发环境

```bash
pnpm dev
```

构建

```bash
pnpm build
```

## 常见问题
[Q&A](https://github.com/cbingb666/115master/discussions/categories/q-a)

## 鸣谢

- [@zhaohappy](https://github.com/zhaohappy) 提供了 [AvPlayer](https://zhaohappy.github.io/libmedia/docs/guide/player) 
