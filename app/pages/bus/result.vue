<template>
  <main class="space-y-6 pb-4">
    <!-- 上部ナビゲーション / 選択区間サマリー -->
    <div class="flex items-center justify-between bg-white rounded-3xl border border-emerald-50/50 shadow-[0_8px_30px_rgb(0,0,0,0.03)] px-5 py-4">
      <button @click="goBack" class="flex items-center gap-1 text-slate-500 hover:text-emerald-700 transition-colors text-xs font-black cursor-pointer bg-slate-50 hover:bg-emerald-50/50 px-3 py-2 rounded-xl border border-slate-100/80 hover:border-emerald-100/50">
        <ChevronLeft class="w-4 h-4" />
        <span>条件変更</span>
      </button>
      <div class="flex items-center gap-2 text-xs font-bold text-slate-700 max-w-[70%] min-w-0 pr-2">
        <span class="truncate block text-emerald-800 font-extrabold">{{ queryBoarding }}</span>
        <ArrowRight class="w-3 h-3 text-slate-300 flex-shrink-0" />
        <span class="truncate block text-slate-500 font-medium">{{ queryDropOff || '指定なし (全表示)' }}</span>
      </div>
    </div>

    <!-- 運行状況要約 -->
    <BusStatusBar :lastUpdated="lastUpdated" :hasDelay="hasDelayInUpcoming" />

    <!-- 次のバス（ハイライト） -->
    <BusNextCard :bus="nextBus" />

    <!-- 統合時刻表リスト -->
    <BusTimetable
      id="timetable-section"
      :timetable="integratedTimetable"
      :nextBusIndex="nextBusIndex"
      v-model:sortType="sortType"
      :selectedDropOffStop="selectedDropOffStop"
    />
  </main>
</template>

<script setup lang="ts">
  import { onMounted } from "vue";
  import { ChevronLeft, ArrowRight } from "lucide-vue-next";
  import { useRoute, navigateTo } from "#imports";
  import { useBusTimetable } from "@/composables/bus/useBusTimetable";

  const route = useRoute();
  const queryBoarding = (route.query.boarding as string) || "";
  const queryDropOff = (route.query.dropOff as string) || "";

  // 出発停留所がない場合は検索ポータルへリダイレクト
  if (!queryBoarding) {
    navigateTo("/bus");
  }

  const {
    // ステート
    boardingStopInput,
    dropOffStopInput,
    selectedBoardingStop,
    selectedDropOffStop,
    lastUpdated,
    isLoading,
    sortType,

    // 算出プロパティ
    integratedTimetable,
    nextBusIndex,
    nextBus,
    hasDelayInUpcoming,

    // メソッド
    handleSearch,
  } = useBusTimetable();

  onMounted(() => {
    if (queryBoarding) {
      boardingStopInput.value = queryBoarding;
      dropOffStopInput.value = queryDropOff;
      handleSearch();
    }
  });

  // 検索画面へ戻る (URLクエリをクリアした初期状態にする)
  const goBack = () => {
    navigateTo({
      path: "/bus",
    });
  };
</script>
