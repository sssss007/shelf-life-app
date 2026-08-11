// 保质期管家 Pro Max — Service Worker
// 每次更新版本号（例如从 v1.4.0 改为 v1.5.0）时，浏览器会自动清除旧缓存并更新应用
const CACHE_VERSION = 'expiry-manager-v1.4.0-20260812-2';

// 需要优先预缓存的核心资源列表
// 注意：icon-192.png / icon-512.png 尚未提供，不加入预缓存，避免 404 导致安装失败
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/vue@3.3.4/dist/vue.global.prod.js',
  'https://cdn.jsdelivr.net/npm/@ericblade/quagga2@1.8.4/dist/quagga.min.js'
];

// 安装阶段：预加载所有静态资源到缓存
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      console.log('[SW] 正在预缓存核心资源...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // 跳过等待，让新版 Service Worker 立即生效
  self.skipWaiting();
});

// 激活阶段：清理掉旧版本的废弃缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_VERSION) {
            console.log('[SW] 清理旧缓存:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // 立即接管所有已打开的页面
  self.clients.claim();
});

// 网络请求拦截
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') return;

  // GitHub Pages 页面导航：网络优先，失败或返回 404 时回退到缓存的 index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // 仅缓存有效的 200 响应
          if (networkResponse && networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return networkResponse;
          }
          // 网络返回错误状态（如 GitHub Pages 404 页）时回退到缓存首页
          return caches.match('./index.html').then((cached) => cached || networkResponse);
        })
        .catch(() => {
          // 断网/离线：回退到缓存的 index.html
          return caches.match('./index.html');
        })
    );
    return;
  }

  // 其余 GET 请求（本站静态资源与 CDN）：缓存优先 + 后台更新（Stale-While-Revalidate）
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. 发起后台网络请求，更新最新资源到缓存
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // 确保拿到有效响应再更新缓存
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // 离线/断网时忽略 fetch 错误，依靠本地缓存支撑
        });

      // 2. 如果本地有缓存，直接毫秒级返回缓存；如果没有，等待网络请求结果
      return cachedResponse || fetchPromise;
    })
  );
});
