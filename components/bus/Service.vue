<template>
  <VCard class="navi-service" flat>
    <VCardItem class="navi-service-direction_indicator">
      <VCardTitle>{{ route }}({{ companyName }})</VCardTitle>
      <VCardSubtitle>{{ destination }}行き</VCardSubtitle>
    </VCardItem>

    <VCardText class="navi-service-time_indicator">
      <span class="text-h4">
        <VIcon>mdi-bus-clock</VIcon>
        <span class="navi-service-time_indicator-time mx-2">{{ time }}</span>
      </span>

      <div>
        <span>到着予定</span>
        <span class="navi-service-time_indicator-delay text-caption text-red-darken-2">({{ delay }}分の遅延)</span>
      </div>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
  .navi-service-time_indicator {
    display: flex;
    align-items: center;

    & > div {
      display: flex;
      flex-direction: column;
    }

    &-delay {
      font-weight: bold;
    }
  }
</style>

<script lang="ts" setup>
  import { computed } from "vue";

  const __PROPS = defineProps({
    companyCode: { type: String, required: true },
    route: { type: String, required: true },
    destination: { type: String, required: true },
    location: { type: Number, required: true },
    plannedTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    delay: { type: Number, required: true }
  });

  const companyName = computed(() => {
    if (__PROPS.companyCode === "KokusaiKogyo") return "国際興業バス";
    if (__PROPS.companyCode === "Seibu") return "西武バス";
    
    return "";
  });
</script>