// 保质期管家 Pro Max — Service Worker
// 应用版本：1.6（2026-09-12）
// 版本更新时请修改 CACHE_VERSION，旧缓存会自动清理
const CACHE_VERSION = 'expiry-manager-v1.6-20260912-1';

// 核心本地资源：确保离线可用
const CORE_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// CDN 资源不参与 install 预缓存，避免某个 CDN 抽风导致 SW 安装失败；
// 首次访问联网后会自动进入运行时缓存。
const CDN_HOSTS = [
  'cdn.tailwindcss.com',
  'cdn.jsdelivr.net'
];

function isCDNRequest(request) {
  const url = new URL(request.url);
  return CDN_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith('.' + host));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(CORE_CACHE))
      .catch(() => {
        // 即使预缓存失败也不让 SW 安装失败
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => Promise.all(
      keyList
        .filter((key) => key !== CACHE_VERSION)
        .map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  // 页面导航：网络优先，失败/异常回退本地首页
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match('./index.html').then((cached) => cached || caches.match('./')))
    );
    return;
  }

  // 同源静态资源与 CDN：缓存优先 + 后台更新
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => undefined);

      return cached || networkFetch;
    })
  );
});