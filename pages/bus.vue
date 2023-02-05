<template>
  <VSheet rounded="lg">
    <head>
      <title>Top</title>
    </head>

    <VList>
      <VListItem>
        <VCard>
          <VCardItem title="北浦03(国際興業バス)">
            <VCardSubtitle>北浦和駅西口 → 埼玉大学</VCardSubtitle>
          </VCardItem>

          <VCardText>
            <VRow align="center">
              <VCol cols="6">
                <span class="text-h4">
                  <VIcon>mdi-bus-clock</VIcon>
                  22:19
                </span>

                <span>到着予定</span>
              </VCol>

              <VCol cols="6">

              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VListItem>

      <VListItem>
        <VCard>
          <VCardItem title="北朝02(国際興業バス)">
            <VCardSubtitle>北朝霞駅 → 埼玉大学</VCardSubtitle>
          </VCardItem>

          <VCardText>
            <VRow align="center">
              <VCol cols="6">
                <span class="text-h4">
                  <VIcon>mdi-bus-clock</VIcon>
                  08:30
                </span>

                <span>到着予定</span>
              </VCol>

              <VCol cols="6">

              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VListItem>
    </VList>
  </VSheet>
</template>

<script setup>
  definePageMeta({
    title: "バス検索"
  });
  
  const busServices = useState("bus/services", () => [
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
  ]);
</script>

<script>
  export default {};
</script>
