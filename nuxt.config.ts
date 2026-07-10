// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";

import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// .env.local が存在する場合は優先して読み込む
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config();
}

export default defineNuxtConfig({
  compatibilityDate: "2025-12-08",
  modules: ["@nuxt/eslint", "@nuxtjs/tailwindcss", "nuxt-gtag", "@vite-pwa/nuxt"],

  ssr: false,

  // 本番でソースマップを公開しない（情報漏洩・デバッグ容易化の防止）
  sourcemap: {
    server: false,
    client: false
  },

  app: {
    head: {
      title: "わかめナビ🌱",

      meta: [
        //
        { charset: "utf-8" },
        { name: "description", content: "埼玉大学周辺を走るバスの運行状況をひと目で確認できるアプリ" },

        { property: "og:site_name", content: "わかめナビ🌱" },
        { property: "og:title", content: "わかめナビ🌱" },
        { property: "og:description", content: "埼玉大学周辺を走るバスの運行状況をひと目で確認できるアプリ" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://wakame-navi.vercel.app/" },
        { property: "og:image", content: "https://wakame-navi.vercel.app/assets/ogp_1200x600.png" },

        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@SU_Mentsuyu" },
        { name: "theme-color", content: "#c8ea50" }
      ],

      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.png" },
        { rel: "apple-touch-icon", href: "/favicon.png" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Zen+Kaku+Gothic+New:wght@400;500;700;900&display=swap" }
      ]
    }
  },

  // インストール可能 PWA + アプリシェルのオフラインキャッシュ。
  // 運行 API は NetworkOnly（オフライン時は失敗を許容。完全オフライン運行は対象外）。
  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "わかめナビ🌱",
      short_name: "わかめナビ🌱",
      description: "埼玉大学周辺を走るバスの運行情報を確認することができます。",
      start_url: "/",
      display: "standalone",
      background_color: "#eeeeee",
      theme_color: "#c8ea50",
      orientation: "portrait",
      lang: "ja",
      icons: [
        {
          src: "/favicon.png",
          sizes: "256x256",
          type: "image/png",
          purpose: "any"
        }
      ]
    },
    workbox: {
      navigateFallback: "/",
      globPatterns: ["**/*.{js,css,html,png,svg,ico,woff2,webp}"],
      runtimeCaching: [
        {
          urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
          handler: "NetworkOnly"
        },
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: "CacheFirst",
          options: {
            cacheName: "google-fonts-stylesheets",
            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: "CacheFirst",
          options: {
            cacheName: "google-fonts-webfonts",
            expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }
          }
        }
      ]
    },
    client: {
      installPrompt: true
    },
    devOptions: {
      enabled: false
    }
  },

  eslint: {
    config: {
      stylistic: true
    }
  },

  gtag: {
    id: "G-XF5BHCFJQV"
  }
});
