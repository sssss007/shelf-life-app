# 📋 保质期管家 Pro Max (Fluid Liquid UI)

![Version](https://img.shields.io/badge/version-v1.4.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Tech](https://img.shields.io/badge/tech-Vue3%20%7C%20TailwindCSS%20%7C%20Quagga2-orange.svg)

> 一款基于 Apple 拟态流体玻璃视觉（Liquid Glass Visual）、纯前端本地存储与离线优先架构的**个人保质期管理工具**。支持手机相机扫码/拍照识别条形码、本地智能记忆库、系统级临期推送提醒与无损数据导入导出/跨端同步。

---

## ✨ 核心特性

- **📱 iOS/Android/PC 全平台适配**：采用 CSS Safe Area 适配 iOS PWA 及 Android WebView 全屏沉浸模式，针对 WebView 渲染性能做了深度优化。
- **📷 智能条码扫描与图像增强**：内置 Quagga2 图像解码引擎，结合 Canvas 图像对比度预处理，大幅提高手机拍照识别条形码的成功率。
- **🧠 离线条码记忆库与自动清理**：
  - 扫过一次的条码自动保存商品名称与保质期，下次扫码即刻自动填表。
  - 支持条码补零归一化兼容（支持 UPC-A/EAN-13 标准匹配）。
  - **智能维护**：商品过期超过 5 天后，自动清理对应条形码记忆，减少无用数据堆积（保留物品档案）。
- **🧮 灵活保质期计算**：支持直接输入天数或算术表达式（如 `30*12` 或 `365*1.5`），自动实时计算过期截止日。
- **🔄 快捷跨端文本同步与备份**：除 JSON 文件导入导出外，新增一键复制/粘贴文本同步功能，方便在微信/QQ/备忘录间快速迁移数据。
- **📊 多维资产可视化**：提供「物品矩阵」、「地理分布（仓储）」与「品类雷达」三大监控面板。
- **🔒 隐私安全与数据自主**：所有数据纯本地 `localStorage` 存储，绝不上传任何第三方服务器。

---