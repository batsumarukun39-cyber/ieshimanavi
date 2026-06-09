import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, CacheFirst, StaleWhileRevalidate, ExpirationPlugin, CacheableResponsePlugin } from "serwist";

declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // OSM タイルをキャッシュ（訪問済みの地図範囲をオフラインでも見られる）
    {
      matcher: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
      handler: new CacheFirst({
        cacheName: "osm-tiles",
        plugins: [
          new ExpirationPlugin({ maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 }),
          new CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
      }),
    },
    // API: places / ferry（最後に取得したデータをオフライン用に保持）
    {
      matcher: /^\/api\/(places|ferry)/,
      handler: new StaleWhileRevalidate({
        cacheName: "api-cache",
        plugins: [
          new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 }),
          new CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
      }),
    },
    // 画像
    {
      matcher: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: new CacheFirst({
        cacheName: "images",
        plugins: [
          new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 }),
          new CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
      }),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
