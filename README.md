# 保质期管家 Pro Max

**当前版本：1.4.0**

一个面向手机浏览器、GitHub Pages 和 Android WebView / 套壳 APK 的本地商品保质期管理工具。

## 功能

- 商品保质期管理
- 临期 / 过期提醒
- 商品分类、搜索与统计
- 存放位置统计
- 条形码拍照识别
- 本地条码记忆库
- 跨设备文本同步
- JSON 数据备份与恢复
- PWA / GitHub Pages 支持
- Service Worker 离线缓存
- 数据使用 `localStorage` 保存，不依赖服务器数据库

## 当前版本的手机优化

本版本针对 Android WebView / 套壳 APK 做了专门优化：

- 手机端页面建立独立滚动区域，避免整个页面滚动时顶部 Header 和底部 Dock 跟随移动。
- Header / Dock 在手机端保持固定，不依赖额外的 transform 定位。
- 手机端关闭会影响 `position: fixed` 合成层稳定性的 Header / Dock 入场位移动画。
- 保留按钮、列表、页面切换、数字变化、弹窗等主要交互动画。
- 降低扫码图片预处理的 CPU 开销。
- 扫码处理完成后释放临时 Object URL，减少连续扫码时的资源占用。
- 保留原有商品、同步、备份、恢复等业务逻辑。

## 自动清理过期记忆

程序启动时会检查商品档案的过期日期。

当带条码商品已经：

**过期超过 5 天**

程序会自动删除该商品对应的本地条码记忆。

注意：

> 只删除条码记忆，不删除商品档案。

因此可以长期使用而不会让无效条码记忆持续累积。

## GitHub Pages 部署

仓库建议结构：

```text
/
├── index.html
├── manifest.json
├── sw.js
├── icon-192.png       # 可选：PWA 图标
└── icon-512.png       # 可选：PWA 图标
```

部署步骤：

1. 将 `index.html`、`manifest.json`、`sw.js`、`README.md` 上传到仓库。
2. 打开 GitHub 仓库的 **Settings → Pages**。
3. 在 **Build and deployment** 中选择 **Deploy from a branch**。
4. 选择 `main` 分支和 `/ (root)` 目录。
5. 保存并等待 GitHub Pages 发布。
6. 使用 GitHub Pages 地址访问。

## PWA

`index.html` 已引用：

```html
<link rel="manifest" href="manifest.json">
```

并会在页面加载后注册：

```text
./sw.js
```

因此 `manifest.json` 和 `sw.js` 应与 `index.html` 放在同一目录。

如果仓库准备安装为 PWA，建议同时提供：

```text
icon-192.png
icon-512.png
```

当前 HTML 已引用这两个图标文件；没有图标文件时，页面主体仍可运行，但 PWA 图标可能无法正常显示。

## Service Worker

`sw.js` 当前负责：

- 缓存应用首页和 Manifest。
- 缓存 Vue、Tailwind CSS、Quagga2 等 CDN 资源。
- GitHub Pages 导航网络失败时回退到缓存的 `index.html`。
- 本站静态资源采用缓存优先并在网络可用时更新。
- 新版本激活后自动删除旧版本缓存。

首次访问建议联网，使 CDN 依赖完成首次缓存。

如果修改了 `index.html`、缓存策略或其他静态资源，建议同步修改 `sw.js` 顶部的：

```js
const CACHE_VERSION = 'expiry-manager-v1.4.0-20260812-2';
```

例如：

```js
const CACHE_VERSION = 'expiry-manager-v1.4.1-20260820-1';
```

这样 Service Worker 会建立新的缓存版本，并清理旧缓存。

## Android WebView / 套壳 APK

建议 WebView 开启：

- JavaScript
- DOM Storage / localStorage
- HTTPS 网络访问
- Service Worker
- Viewport / 全屏适配

不要主动清除 WebView 的站点数据，否则本地商品数据和条码记忆可能丢失。

如果使用 GitHub Pages 地址作为 APK 的 WebView 页面，建议保持网络权限正常，以便首次加载 Vue、Tailwind 和 Quagga2 CDN 依赖。

## 本地数据

应用主要使用以下 `localStorage`：

```text
sp_pro_max_v3
sp_memory_db_v1
```

其中：

- `sp_pro_max_v3`：商品档案
- `sp_memory_db_v1`：条码记忆库

卸载 APK、清除 WebView 数据或清除网站数据都可能导致本地数据丢失。

建议定期在应用设置中使用：

**导出备份文件 (.json)**

保存数据副本。

## 外部依赖

当前页面使用：

- Vue 3.3.4
- Tailwind CSS CDN
- Quagga2 1.8.4

这些依赖通过 CDN 加载，因此首次打开 GitHub Pages 时建议保持网络连接。

## 版本信息

页面标题与界面版本为：

**保质期管家 Pro Max v1.4.0**

修改页面功能后，建议同时更新 Service Worker 的 `CACHE_VERSION`，避免旧缓存影响新版本。

## 许可证

请根据你的 GitHub 仓库实际用途自行添加许可证。
