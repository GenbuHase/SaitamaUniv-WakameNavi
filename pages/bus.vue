<template>
  <VContainer id="busPage">
    <VRow>
      <VCol cols="12">
        <VSheet>
          <VForm class="v-container">
            <VRow>
              <VCol cols="12">
                <VSelect
                  label="区間"
                  :items="[
                    '埼玉大学 → 北浦和駅',
                    '埼玉大学 → 南与野駅',
                    '埼玉大学 → 志木駅',
                    '埼玉大学 → 北朝霞駅',
                    '北浦和駅 → 埼玉大学',
                    '南与野駅 → 埼玉大学',
                    '志木駅 → 埼玉大学',
                    '北朝霞駅 → 埼玉大学',
                  ]"
                  variant="outlined"
                  hide-details
                  prepend-inner-icon="mdi-source-commit-start" />
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
          <VTabs align-tabs="center" v-model="tabState">
            <VTab>到着予定時刻順</VTab>
            <VTab>時刻表順</VTab>
            <VBtn variant="text" icon="mdi-reload" />
          </VTabs>

          <VWindow v-model="tabState">
            <VWindowItem>
              <VList>
                <VListItem v-for="(service, index) of arrivalTimeSortedServices" :key="index">
                  <ArrivalTimeSortedService :="service" />
                </VListItem>
              </VList>
            </VWindowItem>

            <VWindowItem>
              <VList>
                <VListItem v-for="(service, index) of plannedTimeSortedServices" :key="index">
                  <PlannnedTimeSortedService :="service" />
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
  import { ref, computed } from "vue";
  import Bus from "@/utils/Trasportation/Bus";
  
  import ArrivalTimeSortedService from "@/components/bus/ArrivalTimeSortedService.vue";
  import PlannnedTimeSortedService from "@/components/bus/PlannnedTimeSortedService.vue";

  definePageMeta({
    name: "BusPage",
    title: "バス検索"
  });

  const services = ref<Bus.Service[]>([
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
  ]);

  services.value = await fetch("/api/v1/bus/services?start=SaitamaUniv&goal=KitaUrawa").then(res => res.json());

  const tabState = ref(0);

  const arrivalTimeSortedServices = computed(() => sortServices(services.value, 0));
  const plannedTimeSortedServices = computed(() => sortServices(services.value, 1));

  function sortServices (busServices: Bus.Service[], type: number = 0) {
    return Array.from(busServices).sort((a, b) => {
      if ((type === 1 ? a.plannedTime : a.arrivalTime) < (type === 1 ? b.plannedTime : b.arrivalTime)) return -1;
      if ((type === 1 ? a.plannedTime : a.arrivalTime) > (type === 1 ? b.plannedTime : b.arrivalTime)) return 1;
      return 0;
    });
  }
</script>