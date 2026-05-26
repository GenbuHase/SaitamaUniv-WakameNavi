// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: "2025-12-08",
  modules: ["@nuxt/eslint", "@nuxtjs/tailwindcss", "nuxt-gtag"],

  ssr: false,

  app: {
    head: {
      title: "わかめナビ🌱",

      meta: [
        //
        { charset: "utf-8" },

        { property: "og:site_name", content: "わかめナビ🌱" },
        { property: "og:title", content: "わかめナビ🌱" },
        { property: "og:description", content: "埼玉大学周辺を走るバスの運行情報を確認することができます。" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://wakame-navi.vercel.app/" },
        { property: "og:image", content: "https://wakame-navi.vercel.app/assets/ogp_1200x600.png" },

        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@SU_Mentsuyu" }
      ],

      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.png" },
        { rel: "manifest", href: "/manifest.json" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Zen+Kaku+Gothic+New:wght@400;500;700;900&display=swap" }
      ]
    }
  },

  build: {
    transpile: ["vuetify"]
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
