/* ── catVweb 离线壳 (Service Worker) ─────────────────────────
   作用：把页面和外部资源复印一份存在手机里，断网也能打开。

   ⚠️ 改动 journal.html 之后，把下面的 VERSION 加 1，
      否则手机可能继续用旧的缓存。
   ───────────────────────────────────────────────────────── */
const VERSION = 25;
const CACHE = 'catvweb-v' + VERSION;

// 本站文件 —— 必须缓存成功，否则离线打不开
const CORE = [
  './',
  './journal.html',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable.png',
  './icons/icon-apple.png'
];

// 外部资源 —— 版本固定不会变，缓存失败也不影响安装
const CDN = [
  'https://unpkg.com/docx@7.1.0/build/index.js',
  'https://unpkg.com/@supabase/supabase-js@2.115.0/dist/umd/supabase.js',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js',
  'https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito:ital,wght@0,400;0,600;0,800;0,900;1,400&family=ZCOOL+XiaoWei&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE);
    // CDN 逐个来，某一个挂了不连累其他
    await Promise.all(CDN.map(u =>
      cache.add(new Request(u, { mode: 'cors' })).catch(() => {})
    ));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// 网络优先：有网就拿最新的，超时或断网才用缓存
// 用在 HTML 上，保证你改完代码刷新就能看到新版
async function networkFirst(req, timeoutMs) {
  const cache = await caches.open(CACHE);
  try {
    const net = await Promise.race([
      fetch(req),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), timeoutMs))
    ]);
    // ⚠️ 必须是 200，不能用 net.ok —— 见 cacheFirst 里的说明
    if (net && net.status === 200) cache.put(req, net.clone());
    return net;
  } catch (err) {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    const fallback = await cache.match('./journal.html');
    return fallback || new Response('离线，且没有缓存', { status: 503 });
  }
}

// 缓存优先：有缓存直接用，最快
// 用在图标、字体、CDN 脚本上（这些版本固定，不会变）
async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const net = await fetch(req);
    /* ⚠️ 判断条件必须是 status===200，不能用 net.ok。
       net.ok 的定义是 200–299，206（部分响应）也满足 ——
       而 Cache API 明确不收 206，于是抛出
       「Failed to execute 'put' on 'Cache': Partial response ... is unsupported」，
       一条永远挂在控制台的假警报，还会让这个资源始终进不了缓存。
       opaque（跨域、读不到状态码）的 status 是 0，所以要单独放行。 */
    if (net && (net.status === 200 || net.type === 'opaque')) cache.put(req, net.clone());
    return net;
  } catch (err) {
    return new Response('', { status: 504 });
  }
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  /* ⚠️ 只有「资源」才可以碰缓存，接口请求一律放行、绝不插手。
     fetch()/XHR 发出的请求 destination 是空字符串；<script>/<link>/<img>
     这些拿到的是 'script' / 'style' / 'font' / 'image'，导航是 'document'。

     踩过的坑（2026-09-19，查了一整天）：以前这里没有这一句，于是
       GET /rest/v1/vaults?select=data&user_id=eq.XXX
     这种读云端的请求也走了 cacheFirst —— 第一次读完就被冻进缓存，
     之后每次同步读到的都是同一份旧快照，云端怎么变都不知道。
     而上传是 POST、不被拦截，照样推得出去，于是这台设备会不停地
     把旧数据推回云端，把别的设备刚存的东西盖掉。
     表现：手机显示「已同步」、上次同步时间也在更新，数据却纹丝不动，
     另一台设备上的删除和新增全都传不过来。 */
  if (req.destination === '') return;

  let url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  const isHTML = req.mode === 'navigate' ||
    (url.origin === location.origin && url.pathname.endsWith('.html'));

  e.respondWith(isHTML ? networkFirst(req, 3000) : cacheFirst(req));
});

// 页面可以发消息让新版立刻生效
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
