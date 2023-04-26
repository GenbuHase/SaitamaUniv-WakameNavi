<template>
  <VCard class="navi-service" flat>
    <VCardItem class="navi-service-direction_indicator">
      <VCardTitle>{{ route }}({{ companyName }})</VCardTitle>
      <VCardSubtitle>{{ destination }}行き</VCardSubtitle>
    </VCardItem>

    <VCardText class="navi-service-time_indicator">
      <span class="text-h4">
        <VIcon>mdi-bus-clock</VIcon>
        <span class="navi-service-time_indicator-time mx-2">{{ plannedTime }}</span>
      </span>

      <span>定刻</span>
    </VCardText>
  </VCard>
</template>

<script lang="ts" setup>
  import { computed } from "vue";

  const PROPS = defineProps({
    companyCode: { type: String, required: true },
    route: { type: String, required: true },
    destination: { type: String, required: true },
    location: { type: Number, required: true },
    plannedTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    delay: { type: Number, required: true }
  });

  const companyName = computed(() => PROPS.companyCode === "KokusaiKogyo" ? "国際興業バス" : PROPS.companyCode === "Seibu" ? "西武バス" : "");
</script>