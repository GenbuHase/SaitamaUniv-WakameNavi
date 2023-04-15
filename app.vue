<template>
  <VApp>
    <head>
      <meta charset="utf-8" />

      <title>{{ $route.meta.title ? `${$route.meta.title}｜` : ""}}わかめナビ🌱</title>
      <meta name="description" content="埼玉大学周辺を走るバスの運行情報を確認することができます。" />

      <meta property="og:site_name" content="わかめナビ🌱" />
      <meta property="og:title" content="わかめナビ🌱" />
      <meta property="og:description" content="埼玉大学周辺を走るバスの運行情報を確認することができます。" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://wakame-navi.vercel.app/" />
      <meta property="og:image" content="https://wakame-navi.vercel.app/assets/ogp_1200x600.png" />
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:site" content="@SU_Mentsuyu">
    </head>

    <VNavigationDrawer v-model="drawerState" temporary>
      <VList class="py-0">
        <VCard flat>
          <VImg src="/assets/hero_1920x1280.jpg" />
          <VCardTitle>わかめナビ🌱</VCardTitle>
        </VCard>

        <VDivider />

        <VListItem title="トップページ" to="/" prepend-icon="mdi-home" />
        <VListItem title="バス検索" to="/bus" prepend-icon="mdi-bus-side" />
        <VListItem title="電車検索(未実装)" prepend-icon="mdi-train" disabled />
      </VList>
    </VNavigationDrawer>

    <VAppBar elevation="3">
      <VAppBarNavIcon @click.stop="drawerState = !drawerState" />
      <VAppBarTitle>{{ $route.meta.title ? `${$route.meta.title}｜` : ""}}わかめナビ🌱</VAppBarTitle>
    </VAppBar>

    <VMain class="bg-grey-lighten-3">
      <VContainer>
        <VRow>
          <VCol class="d-none d-md-block" md="4">
            <VList class="py-0" density="comfortable">
              <VCard flat>
                <VImg src="/assets/hero_1920x1280.jpg" />
                <VCardTitle class="text-h6">わかめナビ🌱</VCardTitle>
              </VCard>

              <VDivider />

              <VListItem title="トップページ" to="/" prepend-icon="mdi-home" />
              <VListItem title="バス検索" to="/bus" prepend-icon="mdi-bus-side" />
              <VListItem title="電車検索(未実装)" prepend-icon="mdi-train" disabled />
            </VList>
          </VCol>

          <VCol class="text-body-1">
            <NuxtPage />
          </VCol>
        </VRow>
      </VContainer>
    </VMain>
  </VApp>
</template>

<script setup>
  import { ref } from "vue";

  const drawerState = ref(false);
</script>