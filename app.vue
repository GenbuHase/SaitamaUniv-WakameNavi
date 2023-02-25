<template>
  <VApp>
    <head>
      <title>{{ $route.meta.title ? `${$route.meta.title}｜` : ""}}わかめナビ</title>
    </head>

    <VNavigationDrawer v-model="drawer.visible" temporary>
      <VList class="py-0">
        <VCard flat>
          <VImg src="/assets/hero_1920x1280.jpg" />
          <VCardTitle>わかめナビ🌱</VCardTitle>
        </VCard>

        <VDivider />

        <VListItem title="バス検索" to="/bus" prepend-icon="mdi-bus-side" />
        <VListItem title="電車検索(未実装)" prepend-icon="mdi-train" disabled />
        <VListItem title="このアプリについて" to="/about" prepend-icon="mdi-information-outline" />
      </VList>
    </VNavigationDrawer>

    <VAppBar elevation="3">
      <VAppBarNavIcon @click.stop="drawer.visible = !drawer.visible" />
      <VAppBarTitle>{{ $route.meta.title }}</VAppBarTitle>
    </VAppBar>

    <VMain class="bg-grey-lighten-3">
      <VContainer>
        <VRow>
          <VCol class="d-none d-md-block" cols="12 v-col-md-4">
            <VList class="py-0" density="comfortable">
              <VCard flat>
                <VImg src="/assets/hero_1920x1280.jpg" />
                <VCardTitle class="text-h6">わかめナビ🌱</VCardTitle>
              </VCard>

              <VDivider />

              <VListItem title="バス検索" to="/bus" prepend-icon="mdi-bus-side" />
              <VListItem title="電車検索(未実装)" prepend-icon="mdi-train" disabled />
              <VListItem title="このアプリについて" to="/about" prepend-icon="mdi-information-outline" />
            </VList>
          </VCol>

          <VCol>
            <NuxtPage />
          </VCol>
        </VRow>
      </VContainer>
    </VMain>
  </VApp>
</template>

<script setup>
  import { ref } from "vue";

  const drawer = ref({
    visible: false
  });
</script>