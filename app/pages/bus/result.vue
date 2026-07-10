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

    <BusNoticePopup :message="noticeMessage" @close="clearNotice" />

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
      <BusLoadingSkeleton v-else-if="isLoading && !hasTimetableData" />

      <!-- データの取得完了（結果表示） -->
      <div v-else class="space-y-6">
        <!-- API エラー -->
        <div
          v-if="fetchError"
          class="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-800 text-sm shadow-sm"
          role="alert"
        >
          <AlertCircle class="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div class="flex-1 space-y-2">
            <p class="font-semibold">運行情報を取得できませんでした</p>
            <p class="text-xs text-rose-600/80">{{ fetchError }}</p>
            <button
              type="button"
              class="mt-1 px-4 py-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold rounded-xl text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
              :disabled="isLoading"
              @click="onRetry"
            >
              <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isLoading }" />
              再試行
            </button>
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
      </div>
    </Transition>
  </main>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, watch } from "vue";
  import { AlertCircle, ChevronLeft, RefreshCw } from "lucide-vue-next";
  import { useRoute, navigateTo, useSeoMeta } from "#imports";
  import { useBusTimetable, BUS_API_POLL_INTERVAL_MS } from "@/composables/bus/useBusTimetable";

  const route = useRoute();

  // 出発停留所がない場合は検索ポータルへリダイレクト
  if (!route.query.boarding) {
    const query: Record<string, string> = {};
    if (import.meta.dev && route.query.local !== undefined) {
      query.local = String(route.query.local);
    }
    navigateTo({
      path: "/bus",
      query,
    });
  }

  const queryBoarding = computed(() => (route.query.boarding as string) || "");
  const queryDropOff = computed(() => (route.query.dropOff as string) || "");

  useSeoMeta({
    title: () => `${queryBoarding.value} → ${queryDropOff.value || "指定なし"}｜バス検索｜わかめナビ🌱`,
    ogTitle: () => `${queryBoarding.value} → ${queryDropOff.value || "指定なし"}｜バス検索｜わかめナビ🌱`,

    ogDescription: () => {
      const start = queryBoarding.value;
      const end = queryDropOff.value ? `${queryDropOff.value}行` : "すべての行先";

      return `埼玉大学周辺を走るバスの運行情報を確認することができるサービスです。${start}発、${end}のバス運行状況・リアルタイム時刻表を表示しています。`;
    },
  });

  const {
    selectedDropOffStop,
    lastUpdated,
    isLoading,
    fetchError,
    sortType,
    noticeMessage,

    integratedTimetable,
    nextBusIndex,
    nextBus,
    hasDelayInUpcoming,
    isBoardingStopInvalid,
    isDropOffStopInvalid,
    isRouteInvalid,

    handleSearch,
    refreshData,
    isRouteRegistered,
    toggleMyRoute,
    setStops,
    clearNotice,
  } = useBusTimetable();

  const hasTimetableData = computed(() => integratedTimetable.value.length > 0);

  const isAlreadyRegistered = computed(() => {
    return isRouteRegistered(queryBoarding.value, queryDropOff.value);
  });

  const onToggleMyRoute = () => {
    if (isBoardingStopInvalid.value || isDropOffStopInvalid.value || isRouteInvalid.value) return;
    toggleMyRoute(queryBoarding.value, queryDropOff.value);
  };

  const updateQueryStops = () => {
    if (queryBoarding.value) {
      setStops(queryBoarding.value, queryDropOff.value);

      if (isBoardingStopInvalid.value || isDropOffStopInvalid.value || isRouteInvalid.value) {
        return;
      }
      handleSearch();
    }
  };

  const onRetry = () => {
    refreshData();
  };

  let pollTimer: ReturnType<typeof setInterval> | null = null;

  const startPolling = () => {
    stopPolling();
    pollTimer = setInterval(() => {
      if (isBoardingStopInvalid.value || isDropOffStopInvalid.value || isRouteInvalid.value) return;
      if (!queryBoarding.value) return;
      // バックグラウンド更新: スケルトンを出さず前回データを保持
      refreshData({ silent: true });
    }, BUS_API_POLL_INTERVAL_MS);
  };

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  };

  onMounted(() => {
    updateQueryStops();
    startPolling();
  });

  onUnmounted(() => {
    stopPolling();
  });

  watch([queryBoarding, queryDropOff], () => {
    updateQueryStops();
  });

  const goBack = () => {
    const query: Record<string, string> = {};
    if (import.meta.dev && route.query.local !== undefined) {
      query.local = String(route.query.local);
    }
    navigateTo({
      path: "/bus",
      query,
    });
  };
</script>
