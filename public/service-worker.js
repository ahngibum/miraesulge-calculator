const CACHE_NAME = 'myaicfo-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/login.html',
  '/mypage.html',
  '/retirement_simulator.html',
  '/result.html',
  '/result_detail.html',
  '/calculator.js',
  '/header_bg.png',
  '/manifest.json'
];

// 설치 시 캐시 저장
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 네트워크 요청 가로채기 (오프라인 지원)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});