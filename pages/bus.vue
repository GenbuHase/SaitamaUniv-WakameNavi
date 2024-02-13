<template>
  <VContainer id="busPage">
    <VRow>
      <VCol cols="12">
        <VSheet>
          <VForm id="busPage-fetchForm" class="v-container">
            <VRow>
              <VCol cols="12" md="6">
                <VSelect
                  id="busPage-fetchForm-startSelector"
                  label="出発地点" :items="ALL_ROUTES"
                  item-title="name" item-value="id"
                  v-model="startSelector.value"
                  @update:model-value="listGoals($event), saveInterval()"

                  variant="outlined" hide-details
                  prepend-inner-icon="mdi-source-commit-start" />
              </VCol>

              <VCol cols="12" md="6">
                <VSelect
                  id="busPage-fetchForm-goalSelector"
                  label="到着地点" :items="goalSelector.goals"
                  item-title="name" item-value="id"
                  v-model="goalSelector.value"
                  @update:model-value="saveInterval()"

                  variant="outlined" hide-details clearable
                  prepend-inner-icon="mdi-source-commit-end" />
              </VCol>
            </VRow>

            <VRow>
              <VCol cols="12">
                <VBtn
                  id="busPage-fetchForm-submitBtn"
                  block color="primary" prepend-icon="mdi-database-search"
                  @click="fetchServices(startSelector.value, goalSelector.value)">
                  検索
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VSheet>
      </VCol>

      <VCol cols="12">
        <VSheet rounded="lg">
          <VTabs id="busPage-fetchResult-tabs" align-tabs="center" v-model="fetchResultTabs.selected">
            <VTab>到着予定時刻順</VTab>
            <VTab>時刻表順</VTab>
            <VBtn variant="text" icon="mdi-reload" />
          </VTabs>

          <VWindow id="busPage-fetchResult-panels" v-model="fetchResultTabs.selected">
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
  import Bus from "@/utils/Bus";
  import { ALL_ROUTES } from "@/utils/Bus/KokusaiKogyoBus/Routes";
  import LocalStorage from "@/utils/LocalStorage";

  const storage = new LocalStorage("WakameNavi.BusPage");

  // ########## Components ##########
  import ArrivalTimeSortedService from "@/components/bus/ArrivalTimeSortedService.vue";
  import PlannnedTimeSortedService from "@/components/bus/PlannnedTimeSortedService.vue";
  // ########## Components ##########

  // ########## SEO ##########
  const route = useRoute();

  useHead({
    title: `${route.meta.title}｜わかめナビ🌱`,

    meta: [
      { hid: "og:title", property: "og:title", content: `${route.meta.title}｜わかめナビ🌱` },
    ]
  });

  definePageMeta({
    name: "BusPage",
    title: "バス検索"
  });
  // ########## SEO ##########

  // ########## Constants ##########
  const __INTERVALS = [
    { label: "埼玉大学 → 北浦和駅", value: "SaitamaUniv-KitaUrawa" },
    { label: "埼玉大学 → 南与野駅", value: "SaitamaUniv-MinamiYono" },
    { label: "埼玉大学 → 志木駅", value: "SaitamaUniv-Shiki" },
    { label: "埼玉大学 → 北朝霞駅", value: "SaitamaUniv-KitaAsaka" },

    { label: "北浦和駅 → 埼玉大学", value: "KitaUrawa-SaitamaUniv" },
    { label: "南与野駅 → 埼玉大学", value: "MinamiYono-SaitamaUniv" },
    { label: "志木駅 → 埼玉大学", value: "Shiki-SaitamaUniv" },
    { label: "北朝霞駅 → 埼玉大学", value: "KitaAsaka-SaitamaUniv" },

    { label: "南与野駅北入口 → 埼玉大学", value: "MinamiYonoKita-SaitamaUniv" },
    { label: "南与野駅北入口 → 北浦和駅", value: "MinamiYonoKita-KitaUrawa" },

    { label: "埼大裏 → 浦和駅", value: "SaitamaUnivUra-Urawa" },
    { label: "桜区役所 → 浦和駅", value: "SakuraWardOffice-Urawa" },

    { label: "浦和駅 → 埼大裏", value: "Urawa-SaitamaUnivUra" },
    { label: "浦和駅 → 桜区役所", value: "Urawa-SakuraWardOffice" }
  ]
  // ########## Constants ##########

  // ########## Reactives ##########
  const startSelector = ref({
    value: ""
  });

  const goalSelector = ref({
    value: "",
    goals: []
  });

  const fetchResultTabs = ref({
    selected: 0
  });

  const services = ref<Bus.Service[]>([]);

  services.value = [
    {
      arrivalTime: '12:51',
      companyCode: 'KokusaiKogyo',
      delay: 31,
      destination: '南与野駅西口',
      location: 2,
      plannedTime: '12:20',
      route: '志03-3'
    },

    {
      arrivalTime: '13:00',
      companyCode: 'KokusaiKogyo',
      delay: 4,
      destination: '南与野駅西口',
      location: 5,
      plannedTime: '12:56',
      route: '志03-3'
    },

    {
      arrivalTime: '13:34',
      companyCode: 'KokusaiKogyo',
      delay: 2,
      destination: '南与野駅西口',
      location: 10,
      plannedTime: '13:32',
      route: '志03-3'
    },

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
    },

    {
      arrivalTime: '21:29',
      companyCode: 'KokusaiKogyo',
      delay: 7,
      destination: '南与野駅西口',
      location: 2,
      plannedTime: '21:22',
      route: '志03-3'
    },
    
    {
      arrivalTime: '21:30',
      companyCode: 'KokusaiKogyo',
      delay: 231,
      destination: '南与野駅西口',
      location: 5,
      plannedTime: '17:39',
      route: '志03-3'
    },

    {
      arrivalTime: '21:33',
      companyCode: 'KokusaiKogyo',
      delay: 109,
      destination: '南与野駅西口',
      location: 6,
      plannedTime: '19:41',
      route: '志03-3'
    },

    {
      arrivalTime: '21:34',
      companyCode: 'KokusaiKogyo',
      delay: 71,
      destination: '南与野駅西口',
      location: 6,
      plannedTime: '20:23',
      route: '志03-3'
    },

    {
      arrivalTime: '22:10',
      companyCode: 'KokusaiKogyo',
      delay: 172,
      destination: '南与野駅西口',
      location: 15,
      plannedTime: '18:18',
      route: '志03-3'
    }
  ]
  // ########## Reactives ##########

  // ########## Computed ##########
  const arrivalTimeSortedServices = computed(() => {
    return Array.from(services.value).sort((a, b) => {
      if ((a.arrivalTime) < (b.arrivalTime)) return -1;
      if ((a.arrivalTime) > (b.arrivalTime)) return 1;
      return 0;
    });
  });

  const plannedTimeSortedServices = computed(() => {
    return Array.from(services.value).sort((a, b) => {
      if ((a.plannedTime) < (b.plannedTime)) return -1;
      if ((a.plannedTime) > (b.plannedTime)) return 1;
      return 0;
    });
  });
  // ########## Computed ##########

  // ########## Methods ##########
  async function fetchServices (start: string, goal: string) {
    services.value = await fetch(`/api/v1/bus/services?start=${start}&goal=${goal}`).then(res => res.json());
  }

  async function listGoals (start: string) {
    goalSelector.value.value = "";
    goalSelector.value.goals = await fetch(`/api/v1/bus/search?company=KokusaiKogyo&start=${start}`).then(res => res.json());
  }

  function loadInterval () {
    startSelector.value.value = storage.get("interval_start");
    goalSelector.value.value = storage.get("interval_goal");
  }

  function saveInterval () {
    storage.set("interval_start", startSelector.value.value);
    storage.set("interval_goal", goalSelector.value.value);
  }
  // ########## Methods ##########

  onMounted(() => {
    loadInterval();
  });
</script>