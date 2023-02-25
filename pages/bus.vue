<template>
  <VSheet rounded="lg">
    <head>
      <title>Top</title>
    </head>

    <VList>
      <VListItem v-for="(service, index) of busServices" :key="index">
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
</template>

<script setup>
  import { ref } from "vue";
  import Service from "@/components/bus/Service.vue";

  definePageMeta({
    title: "バス検索"
  });

  /*const busServices = ref([
    {
      route: "北浦03",
      destination: "（埼大通り発）北浦和駅西口",
      location: 1,
      plannedTime: "22:19",
      arrivalTime: "22:19",
      delay: 0
    },
  
    {
      route: "北朝02",
      destination: "南与野駅西口",
      location: 3,
      plannedTime: "08:30",
      arrivalTime: "08:58",
      delay: 28
    }
  ]);*/

  const busServices = ref([]);
  busServices.value = await fetch("/api/v1/bus/services?start=SaitamaUniv&goal=KitaUrawa").then(res => res.json());
</script>