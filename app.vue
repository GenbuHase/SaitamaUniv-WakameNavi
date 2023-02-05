<template>
  <VApp>
    <head>
      <title>{{ $route.meta.title ? `${$route.meta.title}｜` : ""}}SaitamaUniv-TransportationStatusBot</title>
    </head>

    <VAppBar flat>
      <span></span>
    </VAppBar>

    <VMain class="bg-grey-lighten-3">
      <VContainer>
        <VRow>
          <VCol cols="4">
            <VItemGroup mandatory>
              <VList>
                <VListItem title="バス検索" to="/bus" prepend-icon="mdi-bus-side" />
                <VListItem title="電車検索(未実装)" prepend-icon="mdi-train" disabled />
                <VListItem title="このアプリについて" to="/about" prepend-icon="mdi-information-outline" />
              </VList>
            </VItemGroup>
          </VCol>

          <VCol>
            <NuxtPage />
          </VCol>
        </VRow>
      </VContainer>
    </VMain>
  </VApp>
</template>