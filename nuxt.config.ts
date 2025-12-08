// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-12-08",
  modules: ["@nuxt/eslint"],

  ssr: false,

  app: {
    head: {
      title: "わかめナビ🌱",

      meta: [
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
        { rel: "manifest", href: "/manifest.json" }
      ],
    },
  },

  css: [
    "vuetify/lib/styles/main.sass",
    "@mdi/font/css/materialdesignicons.min.css"
  ],

  build: {
    transpile: ["vuetify"]
  },

  eslint: {
    config: {
      stylistic: true
    }
  }
});