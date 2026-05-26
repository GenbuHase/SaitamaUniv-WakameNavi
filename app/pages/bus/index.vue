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
      <p v-if="boardingStopInput && availableDropOffStops.length > 0" class="text-[10px] text-slate-400 mt-1.5 text-right tracking-wide">※反対方向のバスに乗る場合は、出発地と到着地を入れ替えてください</p>

      <!-- 検索ボタン -->
      <button @click="onSearch" :disabled="!boardingStopInput" class="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-2xl shadow-[0_8px_20px_rgb(5,150,105,0.2)] flex justify-center items-center gap-2 transition-all duration-300 disabled:opacity-75 disabled:active:scale-100 disabled:bg-slate-300 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer">
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
  import { ArrowLeftRight, Search } from "lucide-vue-next";
  import { useBusTimetable } from "@/composables/bus/useBusTimetable";
  import { navigateTo, useRoute, useSeoMeta } from "#imports";

  const route = useRoute();

  useSeoMeta({
    title: "バス検索｜わかめナビ🌱",
    ogTitle: "バス検索｜わかめナビ🌱",
    ogDescription: "埼玉大学周辺を走るバスの運行情報を確認することができるサービスです。",
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

    // メソッド
    swapStops,
  } = useBusTimetable();


  // 検索実行
  const onSearch = () => {
    if (!boardingStopInput.value) return;
    const query: Record<string, any> = {
      boarding: boardingStopInput.value,
      dropOff: dropOffStopInput.value,
    };
    if (route.query.local !== undefined) {
      query.local = "";
    }
    navigateTo({
      path: "/bus/result",
      query,
    });
  };

  // 戻ってきた際に以前のクエリパラメータから入力状態を復元する
  onMounted(() => {
    if (route.query.boarding) {
      boardingStopInput.value = route.query.boarding as string;
      dropOffStopInput.value = (route.query.dropOff as string) || "";
    }
  });
</script>

