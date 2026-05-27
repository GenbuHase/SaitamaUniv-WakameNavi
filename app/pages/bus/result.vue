<template>
  <main class="space-y-6 pb-4">
    <!-- 上部ナビゲーション / 選択区間サマリー -->
    <BusResultHeader
      :boardingStop="queryBoarding"
      :dropOffStop="queryDropOff"
      :isFavorite="isAlreadyRegistered"
      @clickBack="goBack"
      @clickFavorite="onToggleMyRoute"
    />

    <Transition
      mode="out-in"
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
    >
      <!-- ⚠️ エラー表示 (存在しない停留所や無効なルート) -->
      <div v-if="isBoardingStopInvalid || isDropOffStopInvalid || isRouteInvalid" class="space-y-6">
        <section class="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-rose-100 p-8 text-center space-y-6">
          <div class="inline-flex p-4 bg-rose-50 rounded-full">
            <AlertCircle class="w-10 h-10 text-rose-500" />
          </div>
          
          <div class="space-y-2 max-w-md mx-auto">
            <h2 class="text-lg font-bold text-slate-800">バスの運行情報を照会できません</h2>
            
            <p v-if="isBoardingStopInvalid" class="text-sm text-slate-600">
              指定された出発停留所<strong class="text-rose-600">「{{ queryBoarding }}」</strong>は存在しないか、対応していません。
            </p>
            <p v-else-if="isDropOffStopInvalid" class="text-sm text-slate-600">
              指定された到着停留所<strong class="text-rose-600">「{{ queryDropOff }}」</strong>は存在しないか、対応していません。
            </p>
            <p v-else-if="isRouteInvalid" class="text-sm text-slate-600">
              指定された区間<strong class="text-rose-600">「{{ queryBoarding }} → {{ queryDropOff }}」</strong>を運行する直通バス路線はありません。
            </p>
            
            <p class="text-xs text-slate-400 mt-2">
              停留所の入力間違いや、逆方向の停留所を指定している可能性があります。正しい停留所名を検索フォームより再入力してください。
            </p>
          </div>

          <button @click="goBack" class="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-2xl shadow-[0_6px_15px_rgb(5,150,105,0.15)] inline-flex items-center gap-2 transition-all duration-300 cursor-pointer">
            <ChevronLeft class="w-4 h-4" />
            <span>バス検索へ戻る</span>
          </button>
        </section>
      </div>

      <!-- データの取得中（ローディング） -->
      <BusLoadingSkeleton v-else-if="isLoading" />

      <!-- データの取得完了（結果表示） -->
      <div v-else class="space-y-6">
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
      </div>
    </Transition>
  </main>
</template>

<script setup lang="ts">
  import { computed, onMounted, watch } from "vue";
  import { AlertCircle, ChevronLeft } from "lucide-vue-next";
  import { useRoute, navigateTo, useSeoMeta } from "#imports";
  import { useBusTimetable } from "@/composables/bus/useBusTimetable";

  const route = useRoute();

  // 出発停留所がない場合は検索ポータルへリダイレクト
  if (!route.query.boarding) {
    const query: Record<string, any> = {};
    if (route.query.campaign !== undefined) {
      query.campaign = route.query.campaign;
    }
    if (route.query.local !== undefined) {
      query.local = route.query.local;
    }
    navigateTo({
      path: "/bus",
      query,
    });
  }

  const queryBoarding = computed(() => (route.query.boarding as string) || "");
  const queryDropOff = computed(() => (route.query.dropOff as string) || "");

  useSeoMeta({
    title: () => `${queryBoarding.value} → ${queryDropOff.value || "指定なし"}｜バス検索｜わかめナビ🌱${route.query.campaign ? "(一時公開版)" : ""}`,
    ogTitle: () => `${queryBoarding.value} → ${queryDropOff.value || "指定なし"}｜バス検索｜わかめナビ🌱${route.query.campaign ? "(一時公開版)" : ""}`,

    ogDescription: () => {
      const start = queryBoarding.value;
      const end = queryDropOff.value ? `${queryDropOff.value}行` : "すべての行先";

      return `埼玉大学周辺を走るバスの運行情報を確認することができるサービスです。${start}発、${end}のバス運行状況・リアルタイム時刻表を表示しています。`;
    },
  });

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
    isBoardingStopInvalid,
    isDropOffStopInvalid,
    isRouteInvalid,

    // メソッド
    handleSearch,
    isRouteRegistered,
    toggleMyRoute,
    setStops,
  } = useBusTimetable();

  // 現在のルートが既にマイルート登録されているか判定
  const isAlreadyRegistered = computed(() => {
    return isRouteRegistered(queryBoarding.value, queryDropOff.value);
  });

  // お気に入り（マイルート）の追加・削除トグル
  const onToggleMyRoute = () => {
    // 停留所やルートが無効な場合はお気に入り登録を防止
    if (isBoardingStopInvalid.value || isDropOffStopInvalid.value || isRouteInvalid.value) return;
    toggleMyRoute(queryBoarding.value, queryDropOff.value);
  };

  // クエリパラメータから入力を同期して検索を実行する
  const updateQueryStops = () => {
    if (queryBoarding.value) {
      setStops(queryBoarding.value, queryDropOff.value);

      // 停留所やルートが無効な場合は検索（API呼び出し）を実行しない
      if (isBoardingStopInvalid.value || isDropOffStopInvalid.value || isRouteInvalid.value) {
        return;
      }
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
    const query: Record<string, any> = {};
    if (route.query.campaign !== undefined) {
      query.campaign = route.query.campaign;
    }
    if (route.query.local !== undefined) {
      query.local = route.query.local;
    }
    navigateTo({
      path: "/bus",
      query,
    });
  };
</script>

