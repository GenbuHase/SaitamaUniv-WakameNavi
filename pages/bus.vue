<template>
  <VContainer id="busPage">
    <VRow>
      <VCol cols="12">
        <VSheet>
          <VForm class="v-container">
            <VRow>
              <VCol cols="12" md="6">
                <VSelect
                  label="出発地点"
                  :items="['埼玉大学', '北浦和駅', '北朝霞駅']"
                  variant="outlined"
                  hide-details
                  prepend-inner-icon="mdi-source-commit-start" />
              </VCol>

              <VCol cols="12" md="6">
                <VSelect
                  label="到着地点"
                  :items="['埼玉大学', '北浦和駅', '北朝霞駅']"
                  variant="outlined"
                  hide-details
                  clearable
                  prepend-inner-icon="mdi-source-commit-end" />
              </VCol>
            </VRow>

            <VRow>
              <VCol cols="12">
                <VBtn block color="primary" prepend-icon="mdi-database-search-outline">検索</VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VSheet>
      </VCol>

      <VCol cols="12">
        <VSheet rounded="lg">
          <VList>
            <VListItem v-for="(service, index) of sortServices(busServices)" :key="index">
              <Service :="service" />
            </VListItem>

            <VListItem>
              <VCard flat>
                <VCardItem>
                  <VCardTitle>北浦03(国際興業バス)</VCardTitle>
                  <VCardSubtitle>北浦和駅西口 → 埼玉大学</VCardSubtitle>
                </VCardItem>

                <VCardText>
                  <VRow align="center">
                    <VCol cols="12">
                      <span class="text-h4">
                        <VIcon>mdi-bus-clock</VIcon>
                        <span class="mx-2">22:19</span>
                      </span>

                      <span>到着予定</span>
                    </VCol>
                  </VRow>
                </VCardText>
              </VCard>
            </VListItem>

            <VListItem>
              <VCard flat>
                <VCardItem>
                  <VCardTitle>北朝02(国際興業バス)</VCardTitle>
                  <VCardSubtitle>北朝霞駅 → 埼玉大学</VCardSubtitle>
                </VCardItem>

                <VCardText>
                  <VRow align="center">
                    <VCol cols="12">
                      <span class="text-h4">
                        <VIcon>mdi-bus-clock</VIcon>
                        <span class="mx-2">08:30</span>
                      </span>

                      <span>到着予定</span>
                    </VCol>
                  </VRow>
                </VCardText>
              </VCard>
            </VListItem>
          </VList>
        </VSheet>
      </VCol>
    </VRow>
  </VContainer>
</template>

<style lang="scss" scoped>
  #busPage {
    padding: 0;
  }
</style>

<script lang="ts" setup>
  import { ref } from "vue";
  import Bus from "@/utils/Trasportation/Bus";
  import Service from "@/components/bus/Service.vue";

  definePageMeta({
    name: "BusPage",
    title: "バス検索"
  });

  const busServices = ref([]);
  busServices.value = await fetch("/api/v1/bus/services?start=SaitamaUniv&goal=KitaUrawa").then(res => res.json());

  const sortServices = (services: Bus.Service[]) => {
    return services.sort((a, b) => {
      if (a.arrivalTime < b.arrivalTime) return -1;
      if (a.arrivalTime > b.arrivalTime) return 1;
      return 0;
    });
  }
</script>