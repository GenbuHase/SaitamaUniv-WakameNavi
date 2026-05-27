<template>
  <main class="space-y-6 pb-4">
    <!-- 運行状況要約 -->
    <BusStatusBar :lastUpdated="lastUpdated" :hasDelay="hasDelayInUpcoming" />

    <!-- 📌 ピン留めルート -->
    <BusPinnedRoutesPanel />
    
    <!-- 区間選択パネル -->
    <section class="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-emerald-50/50 p-6 space-y-5">
      <!-- 乗車停留所 -->
      <BusStopSelector
        v-model="boardingStopInput"
        label="出発"
        labelColor="blue"
        idPrefix="boarding"
        :stops="filteredBoardingStops"
        :stopRoutesMap="stopRoutesMap"
      />

      <div class="flex justify-center -my-3 relative z-0">
        <button class="bg-white p-2 rounded-full transition-all duration-300 border border-slate-100 shadow-sm z-10" :class="dropOffStopInput ? 'text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-md hover:scale-110 cursor-pointer' : 'text-slate-300 cursor-not-allowed'" title="出発地と到着地を入れ替える" aria-label="出発地と到着地を入れ替える" :disabled="!dropOffStopInput" @click="swapStops">
          <ArrowLeftRight class="w-4 h-4 rotate-90" />
        </button>
      </div>

      <!-- 降車停留所 -->
      <BusStopSelector
        v-model="dropOffStopInput"
        label="到着"
        labelColor="red"
        idPrefix="dropoff"
        :stops="filteredDropOffStops"
        :stopRoutesMap="stopRoutesMap"
        :disabled="availableDropOffStops.length === 0"
        placeholder="指定なし (すべての行き先を表示)"
        :prependOption="{ label: '指定なし (すべての行き先を表示)', value: '' }"
      />

      <!-- 補足メッセージ -->
      <p v-if="boardingStopInput && availableDropOffStops.length > 0 && !isBoardingStopInvalid && !isDropOffStopInvalid && !isRouteInvalid" class="text-[10px] text-slate-400 mt-1.5 text-right tracking-wide">※反対方向のバスに乗る場合は、出発地と到着地を入れ替えてください</p>

      <!-- ⚠️ エラーメッセージ -->
      <div v-if="isBoardingStopInvalid || isDropOffStopInvalid || isRouteInvalid" class="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-800 text-sm shadow-sm transition-all duration-300">
        <AlertCircle class="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
        <div class="space-y-1">
          <p v-if="isBoardingStopInvalid" class="font-semibold">出発停留所「{{ boardingStopInput }}」は存在しません。</p>
          <p v-else-if="isDropOffStopInvalid" class="font-semibold">到着停留所「{{ dropOffStopInput }}」は存在しません。</p>
          <p v-else-if="isRouteInvalid" class="font-semibold">指定された区間を運行する直通バス路線はありません。</p>
          <p class="text-xs text-rose-600/80">停留所名を正しく入力するか、候補リストから選択してください。</p>
        </div>
      </div>

      <!-- 検索ボタン -->
      <button @click="onSearch" :disabled="!boardingStopInput || isBoardingStopInvalid || isDropOffStopInvalid || isRouteInvalid" class="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-2xl shadow-[0_8px_20px_rgb(5,150,105,0.2)] flex justify-center items-center gap-2 transition-all duration-300 disabled:opacity-75 disabled:active:scale-100 disabled:bg-slate-300 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer">
        <Search class="w-4 h-4" />
        <span class="tracking-wide">検索</span>
      </button>
    </section>

    <!-- ⭐️ マイルート -->
    <BusMyRoutesPanel />
  </main>
</template>

<script setup lang="ts">
  import { onMounted } from "vue";
  import { ArrowLeftRight, Search, AlertCircle } from "lucide-vue-next";
  import { useBusTimetable } from "@/composables/bus/useBusTimetable";
  import { navigateTo, useRoute, useSeoMeta } from "#imports";

  const route = useRoute();

  useSeoMeta({
    title: () => `バス検索｜わかめナビ🌱${route.query.campaign ? "(一時公開版)" : ""}`,
    ogTitle: () => `バス検索｜わかめナビ🌱${route.query.campaign ? "(一時公開版)" : ""}`
  });

  const {
    // ステート
    boardingStopInput,
    dropOffStopInput,
    lastUpdated,

    // 算出プロパティ
    availableDropOffStops,
    filteredBoardingStops,
    filteredDropOffStops,
    stopRoutesMap,
    hasDelayInUpcoming,
    isBoardingStopInvalid,
    isDropOffStopInvalid,
    isRouteInvalid,

    // メソッド
    swapStops,
    setStops,
  } = useBusTimetable();


  // 検索実行
  const onSearch = () => {
    if (!boardingStopInput.value) return;
    const query: Record<string, any> = {
      boarding: boardingStopInput.value,
      dropOff: dropOffStopInput.value,
    };
    if (route.query.campaign !== undefined) {
      query.campaign = route.query.campaign;
    }
    if (route.query.local !== undefined) {
      query.local = route.query.local;
    }
    navigateTo({
      path: "/bus/result",
      query,
    });
  };

  // 戻ってきた際に以前のクエリパラメータから入力状態を復元する
  onMounted(() => {
    if (route.query.boarding) {
      setStops(route.query.boarding as string, (route.query.dropOff as string) || "");
    }
  });
</script>

