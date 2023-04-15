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
                <VBtn block color="primary" prepend-icon="mdi-database-search">検索</VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VSheet>
      </VCol>

      <VCol cols="12">
        <VSheet rounded="lg">
          <VTabs align-tabs="center" v-model="tab">
            <VTab>到着時刻順</VTab>
            <VTab>定刻順</VTab>
            <VBtn variant="text" icon="mdi-reload" />
          </VTabs>

          <VWindow v-model="tab">
            <VWindowItem v-for="item in 2" :key="item">
              <VList>
                <VListItem v-for="(service, index) of sortServices(busServices, item)" :key="index">
                  <Service :="service" :time="item === 1 ? service.arrivalTime : service.plannedTime" />
                </VListItem>
              </VList>
            </VWindowItem>
          </VWindow>
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

  const tab = ref(0);

  const busServices = ref([]);

  /*busServices.value = [
    {
      arrivalTime: '15:11',
      companyCode: 'KokusaiKogyo',
      delay: 16,
      destination: '南与野駅西口',
      location: 6,
      plannedTime: '14:54',
      route: '志03-3'
    },

    {
      arrivalTime: '15:08',
      companyCode: 'KokusaiKogyo',
      delay: 0,
      destination: '南与野駅西口',
      location: 5,
      plannedTime: '15:08',
      route: '北朝02'
    }
  ];*/

  busServices.value = await fetch("/api/v1/bus/services?start=SaitamaUniv&goal=KitaUrawa").then(res => res.json());

  const sortServices = (services: Bus.Service[], type = 0) => {
    return services.sort((a, b) => {
      if ((type === 1 ? a.arrivalTime : a.plannedTime) < (type === 1 ? b.arrivalTime : b.plannedTime)) return -1;
      if ((type === 1 ? a.arrivalTime : a.plannedTime) > (type === 1 ? b.arrivalTime : b.plannedTime)) return 1;
      return 0;
    });
  }

  import KK_BUS_STOPS from "@/utils/Trasportation/Bus/KokusaiKogyo/BusStops";
  import SEIBU_BUS_STOPS from "@/utils/Trasportation/Bus/Seibu/BusStops";

  const sortCandidates = (busStop: string) => {
    let candidates = [];
    let result = [];

    if (busStop in KK_BUS_STOPS) {
      for (const route of KK_BUS_STOPS[busStop].routes) {
        candidates.push(Object.keys(KK_BUS_STOPS).filter(busCode => KK_BUS_STOPS[busCode].routes.includes(route)));
      }
    }

    if (busStop in SEIBU_BUS_STOPS) {
      for (const route of SEIBU_BUS_STOPS[busStop].routes) {
        candidates.push(Object.keys(SEIBU_BUS_STOPS).filter(busCode => SEIBU_BUS_STOPS[busCode].routes.includes(route)));
      }
    }

    for (const candidate of candidates) result.push(...candidate);
    return result;
  }

  console.log(sortCandidates("Shiki"));
</script>