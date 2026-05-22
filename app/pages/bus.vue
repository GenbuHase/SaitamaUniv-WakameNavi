<template>
  <main class="space-y-6 pb-4">
    <!-- 運行状況要約 -->
    <BusStatusBar :lastUpdated="lastUpdated" :hasDelay="hasDelayInUpcoming" />

    <!-- 次のバス（ハイライト） -->
    <BusNextCard :bus="nextBus" />

    <!-- マイルート管理パネル -->
    <BusMyRoutesPanel
      :myRoutes="myRoutes"
      :pinnedRoutes="pinnedRoutes"
      @applyRoute="onApplyRoute"
      @removeMyRoute="removeMyRoute"
      @togglePinRoute="togglePinRoute"
      @updateMyRoutes="updateMyRoutes"
    />

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
      <p v-if="boardingStopInput && availableDropOffStops.length > 0" class="text-[10px] text-slate-400 mt-1.5 text-right tracking-wide">※反対方向のバスに乗る場合は、出発地と到着地を入れ替えてください</p>

      <!-- 検索ボタン -->
      <button @click="handleSearch" :disabled="isLoading" class="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-2xl shadow-[0_8px_20px_rgb(5,150,105,0.2)] flex justify-center items-center gap-2 transition-all duration-300 disabled:opacity-70 disabled:active:scale-100 cursor-pointer">
        <Search class="w-4 h-4" />
        <span class="tracking-wide">検索</span>
      </button>

      <!-- マイルート登録ボタン -->
      <button
        v-if="boardingStopInput"
        @click="addMyRoute(boardingStopInput, dropOffStopInput)"
        :disabled="isAlreadyRegistered"
        class="w-full py-3.5 bg-slate-50 hover:bg-emerald-50/55 active:scale-[0.98] text-slate-600 hover:text-emerald-700 font-bold rounded-2xl border border-slate-100 hover:border-emerald-100/50 flex justify-center items-center gap-2 transition-all duration-300 disabled:opacity-60 disabled:active:scale-100 disabled:hover:bg-slate-50 disabled:hover:text-slate-400 disabled:hover:border-slate-100 cursor-pointer"
      >
        <Star class="w-4 h-4" :class="isAlreadyRegistered ? 'fill-amber-400 text-amber-400' : 'text-slate-400'" />
        <span class="tracking-wide text-xs">
          {{ isAlreadyRegistered ? 'このルートは登録済みです' : '現在のルートをマイルートに登録' }}
        </span>
      </button>
    </section>

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
  import { computed, nextTick } from "vue";
  import { ArrowLeftRight, Search, Star } from "lucide-vue-next";
  import { useBusTimetable } from "@/composables/bus/useBusTimetable";

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
    pinnedRoutes,
    addMyRoute,
    removeMyRoute,
    togglePinRoute,
    updateMyRoutes,
    applyRoute,

    // 算出プロパティ
    availableDropOffStops,
    filteredBoardingStops,
    filteredDropOffStops,
    stopRoutesMap,
    integratedTimetable,
    nextBusIndex,
    nextBus,
    hasDelayInUpcoming,

    // メソッド
    handleSearch,
    swapStops,
  } = useBusTimetable();

  // 現在の入力区間が既に登録されているか判定
  const isAlreadyRegistered = computed(() => {
    return myRoutes.value.some(
      r => r.boarding === boardingStopInput.value && r.dropOff === dropOffStopInput.value
    );
  });

  // マイルート選択時の自動スクロール処理
  const onApplyRoute = (boarding: string, dropOff: string) => {
    // 選択されたルートを適用して検索
    applyRoute(boarding, dropOff);

    // DOM更新後に時刻表の位置までスムーズに自動スクロール
    nextTick(() => {
      setTimeout(() => {
        const element = document.getElementById("timetable-section");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
    });
  };
</script>
