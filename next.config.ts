import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withSerwistInit from "@serwist/next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // 開発中は SW を無効化（HMR との競合を防ぐ）
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Turbopackが日本語パスでパニックするため無効化 (Turbopack bug with non-ASCII paths)
  turbopack: undefined,
};

export default withSerwist(withNextIntl(nextConfig));
