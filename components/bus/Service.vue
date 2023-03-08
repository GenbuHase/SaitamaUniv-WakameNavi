<template>
  <VCard flat>
    <VCardItem>
      <VCardTitle>{{ route }}({{ companyCode === "KokusaiKogyo" ? "国際興業バス" : "西武バス" }})</VCardTitle>
      <VCardSubtitle>{{ destination }}行き</VCardSubtitle>
    </VCardItem>

    <VCardText>
      <VRow align="center">
        <VCol cols="12">
          <span class="text-h4">
            <VIcon>mdi-bus-clock</VIcon>
            <span class="mx-2">{{ arrivalTime }}</span>
          </span>

          <span>到着予定</span>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<script>
  export default {
    props: {
      companyCode: { type: String, required: true },
      route: { type: String, required: true },
      destination: { type: String, required: true },
      location: { type: Number, required: true },
      plannedTime: { type: String, required: true },
      arrivalTime: { type: String, required: true },
      delay: { type: Number, required: true }
    }
  }
</script>