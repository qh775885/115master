# 115Master

115Master 是一个 115 网盘的 Tampermonkey 脚本，旨在提升 `115网盘` 的浏览体验（屌炸天的功能）。

Tips: 小作坊出品下料很猛，请谨慎食用，如果觉得好用，请给个 Star 支持一下，谢谢。

![preview](./docs/images/preview.png)

## 功能

- 🎨 `Ultra原画` 增强
- 👁 视频缩略图
- 🚀 超快的加载速度，丝滑的快进、拖拽播放体验 (快好几倍)
- 🤖 根据番号自动匹配在线外挂字幕
- 🔍 播放器集成番号信息展示
- ⌚ 播放器展示播放列表

## 安装

以下安装说明，请认真仔细阅读!

1. 安装 [Tampermonkey](https://www.tampermonkey.net/)，后开启 [浏览器扩展开发者模式](https://www.tampermonkey.net/faq.php#Q209)。

2. 一键安装 [115master.user.js](https://github.com/cbingb666/115master/releases/latest/download/115master.user.js) 安装 【115Master】脚本。

3. 油猴面板勾选启动 【115Master】脚本。

4. 安装 [User-Agent Switcher and Manager](https://chromewebstore.google.com/detail/user-agent-switcher-and-m/bhchdcejhohfmigjafbampogmaanbfkg) 插件。

    ```txt
    Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 115Browser/27.0.6.3
    ```

    - 4.1 如下图所示，复制上面的 `User-Agent` 填入。
    - 4.2 点击 `Apply（all tabs）`。
    - 4.3 点击 `Restart`。
    - 4.4 重启浏览器生效。

    <img width="600" alt="user-agent-settings-intro" src="https://github.com/user-attachments/assets/011fa1c7-06c6-46b0-94a5-5ab8702b7632" />


6. 如果不能使用，还有可能是与其他的油猴插件冲突，请关闭其他插件重试。

7. 如果你更新了 115Master，发现 `User-Agent` 又失效了，请在 `User-Agent Switcher And Manager` 点击 `restart` 再重启浏览器来恢复它。

8. 👆上面一通操作后，还是无法使用的话请进入 [TG群](https://t.me/+EzfL2xXhlOA4ZjBh) 反馈或提交 [Issues](https://github.com/cbingb666/115master/issues)，请说明你的详情操作！

## 常见问题

### Q: 为什么 【Ultra原画】 部分视频无法播放、黑屏、没有声音？

A: 因为部分视频格式浏览器不支持播放。如：常见的 `.mkv` 可能没有声音，部分 `.mp4` 由于视频内部编码不兼容也会有些意外的情况。

Q: (好奇宝宝) 那老湿老湿这有没有办法解决呢？

A: 有，请暂时将这部分视频降低画质播放。我正在开发一个应用程序 `player-protocol` 用来支持在网盘页面中一键唤起 MPV 本地播放器。

### Q: 为什么缩略图很慢？

A: 这是因为网络速度的问题或者你高强度使用被限流或者高峰时间也会有限流。

### Q: 为什么有些视频没有字幕？

A: 因为现在只支持了绝大部分番号的识别。

### Q: 啊啊啊我想要这个功能那个功能，能不能支持呀？

A：你有想法很好！请提交到 [Issues](https://github.com/cbingb666/115master/issues)，作者脑容量有限，挂在 Issues 的会优先考虑解决。

### Q: 我已经有 Emby、Jellyfin 为啥还要这个插件呀？

A: 因为这是个下载、播放、字幕、预览一条龙的插件（你会体会不一样的快乐的）。常见的影库从下载、试看、播放，整个过程还是比较割裂不方便，影库更适合做为影片收藏归档方便以后反复品味~


