<template>
  <main class="space-y-6 pb-4">
    <!-- 上部ナビゲーション / 選択区間サマリー -->
    <BusResultHeader
      :boardingStop="queryBoarding"
      :dropOffStop="queryDropOff"
      :isFavorite="isAlreadyRegistered"
      @clickBack="goBack"
      @clickFavorite="toggleMyRoute"
    />

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
  import { computed, onMounted, watch } from "vue";
  import { useRoute, navigateTo } from "#imports";
  import { useBusTimetable } from "@/composables/bus/useBusTimetable";

  const route = useRoute();

  // 出発停留所がない場合は検索ポータルへリダイレクト
  if (!route.query.boarding) {
    navigateTo("/bus");
  }

  const queryBoarding = computed(() => (route.query.boarding as string) || "");
  const queryDropOff = computed(() => (route.query.dropOff as string) || "");

  const {
    // ステート
    boardingStopInput,
    dropOffStopInput,
    selectedBoardingStop,
    selectedDropOffStop,
    lastUpdated,
    isLoading,
    sortType,

    // マイルートステート＆メソッド
    myRoutes,
    addMyRoute,
    removeMyRoute,

    // 算出プロパティ
    integratedTimetable,
    nextBusIndex,
    nextBus,
    hasDelayInUpcoming,

    // メソッド
    handleSearch,
  } = useBusTimetable();

  // 現在のルートが既にマイルート登録されているか判定
  const isAlreadyRegistered = computed(() => {
    return myRoutes.value.some(
      r => r.boarding === queryBoarding.value && r.dropOff === queryDropOff.value
    );
  });

  // お気に入り（マイルート）の追加・削除トグル
  const toggleMyRoute = () => {
    if (isAlreadyRegistered.value) {
      const target = myRoutes.value.find(
        r => r.boarding === queryBoarding.value && r.dropOff === queryDropOff.value
      );
      if (target) {
        removeMyRoute(target.id);
      }
    } else {
      addMyRoute(queryBoarding.value, queryDropOff.value);
    }
  };

  // クエリパラメータから入力を同期して検索を実行する
  const updateQueryStops = () => {
    if (queryBoarding.value) {
      boardingStopInput.value = queryBoarding.value;
      dropOffStopInput.value = queryDropOff.value;
      handleSearch();
    }
  };

  onMounted(() => {
    updateQueryStops();
  });

  // 2回目以降の照会（クエリパラメータの変更）を監視して更新する
  watch([queryBoarding, queryDropOff], () => {
    updateQueryStops();
  });

  // 検索画面へ戻る (URLクエリをクリアした初期状態にする)
  const goBack = () => {
    navigateTo({
      path: "/bus",
    });
  };
</script>
