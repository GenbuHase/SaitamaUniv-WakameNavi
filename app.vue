<template>
  <VApp>
    <VNavigationDrawer v-model="drawerState" temporary>
      <VList class="py-0">
        <VImg class="ma-6" src="/assets/logo.svg" />

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
              <VImg class="ma-6" src="/assets/logo.svg" />

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