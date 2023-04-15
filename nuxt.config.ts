// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,

  app: {
    head: {
      title: "わかめナビ🌱",

      meta: [
        { charset: "utf-8" },
        
        { hid: "og:site_name", property: "og:site_name", content: "わかめナビ🌱" },
        { hid: "og:title", property: "og:title", content: "わかめナビ🌱" },
        { hid: "og:description", property: "og:description", content: "埼玉大学周辺を走るバスの運行情報を確認することができます。" },
        { hid: "og:type", property: "og:type", content: "website" },
        { hid: "og:url", property: "og:url", content: "https://wakame-navi.vercel.app/" },
        { hid: "og:image", property: "og:image", content: "https://wakame-navi.vercel.app/assets/ogp_1200x600.png" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:creator", content: "@SU_Mentsuyu" }
      ]
    }
  },
  
  css: [
    "vuetify/lib/styles/main.sass",
    "@mdi/font/css/materialdesignicons.min.css"
  ],
  
  build: {
    transpile: ["vuetify"]
  }
})
