# 保质期管家 Pro Max

**当前版本：1.5.0（屏幕适配优化版）**

一个面向手机浏览器、GitHub Pages 和 Android WebView / 套壳 APK 的本地商品保质期管理工具。

## 功能

- 商品保质期管理（支持按天 / 按月双单位计算）
- 按月计算保质期：直接对年月做加减，正确处理 31号→30号、2月闰日等边界
- 临期 / 过期提醒，三态区分
- 商品分类、搜索与统计
- 存放位置统计
- 条形码拍照识别
- 本地条码记忆库
- 跨设备文本同步
- JSON 数据备份与恢复
- PWA / GitHub Pages 支持
- Service Worker 离线缓存
- 数据使用 `localStorage` 保存，不依赖服务器数据库

## 最新屏幕适配优化（v1.5.0）

本次针对不同机型做了以下修复：

- 兼容旧机型：为 `100dvh` / `100svh` 增加 `100vh` fallback，避免老 WebView 高度错乱。
- 全面屏安全区：适配刘海屏、灵动岛、Android 挖孔屏，Header 与底部 Dock 自动避开状态栏和手势条。
- 安卓输入法：通过 `visualViewport` 动态修正可视高度，避免键盘弹起时布局跳动。
- 弹窗高度：兼容不支持动态视口单位的旧浏览器。
- iOS 输入放大：将输入框字号兜底为 `16px`，避免 iOS Safari 聚焦时自动放大页面。
- 超小屏：宽度 ≤ 380px 时自动隐藏 Header 按钮文字，只保留图标，防止挤压。

## 加载性能优化

- Service Worker 不再把 CDN 资源放入安装阶段的硬性预缓存，避免某个 CDN 抽风导致 PWA 安装失败。
- 本地资源优先缓存，CDN 资源改为运行时“缓存优先 + 后台更新”。
- 建议将 Vue、Tailwind、Quagga2 改为本地构建或本地文件，以彻底消除首屏对 CDN 的依赖。
- Quagga2 体积较大，建议按需加载（在用户第一次扫码时才动态载入），而不是页面启动时就下载。


## 过期商品处理功能

- ✅ 一键清理所有已过期商品，并同时删除对应条码记忆
- ✅ 单件过期商品可点击“已处理”，移入归档记录
- ✅ 归档记录可恢复或彻底删除
- ✅ 启动时自动提醒临期/过期商品
- ✅ 设置中可开启“启动时自动清理过期 N 天以上商品”
- ✅ 过期商品显示处理建议，临期商品提示优先使用

## Service Worker

当前缓存版本：

```js
const CACHE_VERSION = 'expiry-manager-v1.5.0-screenfit-20260901-1';
```

策略：

- 页面导航：网络优先，失败时回退缓存的 `index.html`
- 本地静态资源：缓存优先 + 后台更新
- CDN 资源：缓存优先 + 后台更新
- 新版本激活后自动删除旧缓存

修改页面后，请同步更新上面 `CACHE_VERSION`。

## GitHub Pages 部署

仓库建议结构：

```text
/
├── index.html
├── manifest.json
├── sw.js
├── icon-192.png       # 建议提供：PWA 图标
├── icon-512.png       # 建议提供：PWA 图标
└── README.md
```

部署步骤：

1. 上传以上文件到仓库。
2. GitHub 仓库 Settings → Pages。
3. Deploy from a branch，选择 `main` + `/ (root)`。
4. 保存后等待发布。

## PWA 注意

当前 `manifest.json` 没有声明 `icons`，因为仓库尚未提供 `icon-192.png` / `icon-512.png`。

如果希望安装为完整 PWA，请补充两个 PNG 图标并加入：

```json
"icons": [
  { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
  { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
]
```

没有图标时，页面主体功能仍可正常使用，但浏览器“添加到主屏幕”可能不够完整。

## 已知限制与后续建议

- 首次加载仍依赖 CDN，网络较差时首屏会慢；建议将 Vue / Tailwind / Quagga2 改为本地文件或使用构建工具打包。
- Tailwind CDN 是运行时扫描页面生成样式，在低端机上有一定性能开销；如追求极致流畅，可改为预编译 Tailwind CSS。
- Quagga2 条形码识别属于重型计算，建议在低端机提示用户“保持稳定、光线充足”。
- 数据保存在 `localStorage`，不建议存放超大容量；请定期导出 JSON 备份。

## 本地数据

应用主要使用以下 `localStorage`：

```text
sp_pro_max_v3
sp_memory_db_v1
```

卸载、清除站点数据都会导致本地数据丢失，请定期备份。

## 外部依赖

- Vue 3.3.4
- Tailwind CSS CDN
- Quagga2 1.8.4