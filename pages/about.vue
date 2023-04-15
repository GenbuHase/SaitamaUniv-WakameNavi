<template>
  <VSheet class="pa-6">
    SaitamaUniv-TransportationStatusBotは以下の機能を提供します。
  </VSheet>
</template>

<script setup>
  // ########## SEO ##########
  const route = useRoute();

  useHead({
    title: `${route.meta.title}｜わかめナビ🌱`,

    meta: [
      { hid: "og:title", property: "og:title", content: `${route.meta.title}｜わかめナビ🌱` },
    ]
  });

  definePageMeta({
    name: "AboutPage",
    title: "本サイトについて"
  });
  // ########## SEO ##########
</script>