// 每次更新版本号（例如从 v1.2.1 改为 v1.2.2），浏览器就会自动清除旧缓存并更新应用
const CACHE_NAME = 'expire-manager-v1.2.2';

// 需要优先预缓存的核心资源列表
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/vue@3.3.4/dist/vue.global.prod.js',
  'https://cdn.jsdelivr.net/npm/@ericblade/quagga2@1.8.4/dist/quagga.min.js'
];

// 安装阶段：预加载所有静态资源到缓存中
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] 正在预缓存核心资源...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // 跳过等待，让新版本 Service Worker 立即生效
  self.skipWaiting();
});

// 激活阶段：清理掉旧版本的废弃缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
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

// 网络请求拦截：采用“缓存优先 + 后台更新”策略 (Stale-While-Revalidate)
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. 发起后台网络请求，更新最新资源到缓存
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // 确保拿到有效响应再更新缓存
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // 离线/断网时忽略 fetch 错误，依靠本地缓存支撑
        });

      // 2. 如果本地有缓存，直接毫秒级秒开返回缓存；如果没有，等待网络请求结果
      return cachedResponse || fetchPromise;
    })
  );
});