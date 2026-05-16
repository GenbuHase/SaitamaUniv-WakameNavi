<template>
  <main class="space-y-6 pb-4">
    <!-- 運行状況要約 -->
    <section class="flex justify-between items-center px-2">
      <div class="text-xs text-emerald-600/80 font-medium flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100/50">
        <Clock class="w-3.5 h-3.5" />
        {{ formatTime(lastUpdated) }} 現在
      </div>
      <span v-if="hasDelayInUpcoming" class="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse shadow-sm"> <AlertTriangle class="w-3.5 h-3.5" /> 遅延発生中 </span>
    </section>

    <!-- 次のバス（ハイライト） -->
    <section v-if="nextBus" class="bg-gradient-to-br from-[#009140] to-emerald-700 text-white rounded-[2rem] shadow-[0_20px_40px_rgba(0,145,64,0.2)] p-7 relative overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,145,64,0.3)] hover:-translate-y-1">
      <!-- 装飾用背景サークル -->
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

      <!-- 会社ロゴっぽい表示 -->
      <div class="absolute top-5 right-5 text-[10px] font-bold px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30 shadow-sm">
        {{ nextBus.company === "Kokusai" ? "国際興業バス" : "西武バス" }}
      </div>

      <div class="absolute -bottom-6 -right-6 p-3 opacity-10 transform -rotate-6">
        <Bus class="w-40 h-40 drop-shadow-2xl" />
      </div>

      <div class="relative z-10">
        <div class="flex items-center gap-2.5 mb-2 opacity-90">
          <span class="text-xs font-bold border border-white/40 px-2.5 py-1 rounded-full bg-black/10 backdrop-blur-sm shadow-sm tracking-widest">先発</span>
          <span class="text-sm font-medium tracking-wide">{{ nextBus.boardingStopName }} 発</span>
        </div>

        <div class="flex items-baseline gap-3 my-3">
          <span class="text-[4rem] leading-none font-black tracking-tighter tabular-nums drop-shadow-md">
            {{ nextBus.estimatedTime.slice(0, 5) }}
            <span class="text-3xl ml-1 font-bold">{{ nextBus.estimatedTime.slice(6) }}</span>
          </span>
        </div>

        <div class="flex items-center gap-3 text-sm font-medium text-emerald-50/90 mb-5">
          <span class="bg-black/10 px-2 py-0.5 rounded-md backdrop-blur-sm">定刻: {{ nextBus.scheduledTime }}</span>
          <span v-if="nextBus.delay > 0" class="bg-red-500/90 backdrop-blur-md text-white px-2.5 py-0.5 rounded-md text-xs font-bold shadow-sm border border-red-400/50"> +{{ nextBus.delay }}分 遅れ </span>
        </div>

        <div class="pt-4 border-t border-white/20 flex items-center gap-3">
          <span class="bg-white text-emerald-800 font-bold px-2 py-1 rounded-md text-xs shadow-sm">
            {{ nextBus.routeCode }}
          </span>
          <span class="flex-1 font-bold text-xl tracking-wide drop-shadow-sm">{{ nextBus.destination }} <span class="text-sm font-medium opacity-80">行</span></span>
        </div>
      </div>
    </section>

    <section v-else class="bg-emerald-50/50 border border-emerald-100 rounded-[2rem] p-10 text-center text-emerald-700/60 shadow-sm">
      <div class="flex justify-center mb-3 opacity-50"><Bus class="w-12 h-12" /></div>
      <p class="font-bold text-lg">該当するバスがありません</p>
      <p class="text-xs mt-2 opacity-80">条件を変更するか、本日の運行を終了している可能性があります。</p>
    </section>

    <!-- 区間選択パネル -->
    <section class="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-emerald-50/50 p-6 space-y-5">
      <!-- 乗車停留所 -->
      <div>
        <label class="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
          <div class="p-1 bg-blue-50 rounded-full"><MapPin class="w-3 h-3 text-blue-500" /></div>
          出発
        </label>
        <div class="relative group">
          <input type="text" v-model="boardingStopInput" @focus="isBoardingDropdownOpen = true" @click="isBoardingDropdownOpen = true" @blur="isBoardingDropdownOpen = false" @keydown="handleBoardingKeyDown" placeholder="バス停名を入力または選択" class="w-full p-3.5 pl-4 pr-16 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium text-slate-700 transition-all duration-300" autocomplete="off" />
          <div class="absolute right-2 top-0 bottom-0 flex items-center gap-0.5">
            <button v-show="boardingStopInput" @mousedown.prevent="boardingStopInput = ''" class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors" title="クリア">
              <X class="w-4 h-4" />
            </button>
            <ChevronDown class="w-5 h-5 text-slate-400 pointer-events-none transition-transform duration-300 group-focus-within:text-emerald-500 mr-2" :class="{ 'rotate-180': isBoardingDropdownOpen }" />
          </div>

          <transition enter-active-class="transition duration-150 ease-out" enter-from-class="transform scale-95 opacity-0 translate-y-[-10px]" enter-to-class="transform scale-100 opacity-100 translate-y-0" leave-active-class="transition duration-100 ease-in" leave-from-class="transform scale-100 opacity-100 translate-y-0" leave-to-class="transform scale-95 opacity-0 translate-y-[-10px]">
            <div v-if="isBoardingDropdownOpen" id="boarding-dropdown-container" class="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] max-h-60 overflow-auto">
              <ul class="py-1.5">
                <li v-if="filteredBoardingStops.length === 0" class="px-4 py-4 text-sm text-slate-500 text-center">見つかりませんでした</li>
                <li v-for="(stop, index) in filteredBoardingStops" :id="'boarding-stop-' + index" :key="stop" @mousedown.prevent="selectBoardingStop(stop)" @mouseenter="boardingActiveIndex = index" class="px-4 py-3 cursor-pointer transition-colors group border-b border-slate-50/50 last:border-0" :class="boardingActiveIndex === index ? 'bg-emerald-50/50' : 'hover:bg-emerald-50/50'">
                  <div class="text-sm font-medium transition-colors" :class="boardingActiveIndex === index ? 'text-emerald-700' : 'text-slate-700 group-hover:text-emerald-700'">{{ stop }}</div>
                  <div class="text-[10px] text-slate-400 mt-0.5 truncate tracking-wide" title="運行系統">{{ stopRoutesMap[stop]?.join(", ") }}</div>
                </li>
              </ul>
            </div>
          </transition>
        </div>
      </div>

      <div class="flex justify-center -my-3 relative z-0">
        <button class="bg-white p-2 rounded-full transition-all duration-300 border border-slate-100 shadow-sm z-10" :class="dropOffStopInput ? 'text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-md hover:scale-110 cursor-pointer' : 'text-slate-300 cursor-not-allowed'" title="出発地と到着地を入れ替える" aria-label="出発地と到着地を入れ替える" :disabled="!dropOffStopInput" @click="swapStops">
          <ArrowLeftRight class="w-4 h-4 rotate-90" />
        </button>
      </div>

      <!-- 降車停留所 -->
      <div>
        <label class="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
          <div class="p-1 bg-red-50 rounded-full"><MapPin class="w-3 h-3 text-red-500" /></div>
          到着
        </label>
        <div class="relative group">
          <input type="text" v-model="dropOffStopInput" @focus="isDropOffDropdownOpen = true" @click="isDropOffDropdownOpen = true" @blur="isDropOffDropdownOpen = false" @keydown="handleDropOffKeyDown" :disabled="availableDropOffStops.length === 0" placeholder="指定なし (すべての行き先を表示)" class="w-full p-3.5 pl-4 pr-16 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium text-slate-700 disabled:bg-slate-100/50 disabled:text-slate-400 disabled:opacity-60 transition-all duration-300" autocomplete="off" />
          <div class="absolute right-2 top-0 bottom-0 flex items-center gap-0.5">
            <button v-show="dropOffStopInput" @mousedown.prevent="dropOffStopInput = ''" class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors disabled:opacity-50" :disabled="availableDropOffStops.length === 0" title="クリア">
              <X class="w-4 h-4" />
            </button>
            <ChevronDown class="w-5 h-5 text-slate-400 pointer-events-none transition-transform duration-300 group-focus-within:text-emerald-500 mr-2" :class="{ 'rotate-180': isDropOffDropdownOpen }" />
          </div>

          <transition enter-active-class="transition duration-150 ease-out" enter-from-class="transform scale-95 opacity-0 translate-y-[-10px]" enter-to-class="transform scale-100 opacity-100 translate-y-0" leave-active-class="transition duration-100 ease-in" leave-from-class="transform scale-100 opacity-100 translate-y-0" leave-to-class="transform scale-95 opacity-0 translate-y-[-10px]">
            <div v-if="isDropOffDropdownOpen && availableDropOffStops.length > 0" id="dropoff-dropdown-container" class="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] max-h-60 overflow-auto">
              <ul class="py-1.5">
                <li id="dropoff-stop-0" @mousedown.prevent="selectDropOffStop('')" @mouseenter="dropOffActiveIndex = 0" class="px-4 py-3 text-sm font-bold cursor-pointer border-b border-slate-50/50 flex items-center gap-2 transition-colors" :class="dropOffActiveIndex === 0 ? 'bg-slate-50 text-slate-700' : 'text-slate-500 hover:bg-slate-50'">
                  <span class="w-2 h-2 rounded-full bg-slate-300"></span>
                  指定なし (すべての行き先を表示)
                </li>
                <li v-if="filteredDropOffStops.length === 0" class="px-4 py-4 text-sm text-slate-500 text-center">見つかりませんでした</li>
                <li v-for="(stop, index) in filteredDropOffStops" :id="'dropoff-stop-' + (index + 1)" :key="stop" @mousedown.prevent="selectDropOffStop(stop)" @mouseenter="dropOffActiveIndex = index + 1" class="px-4 py-3 cursor-pointer transition-colors group border-b border-slate-50/50 last:border-0" :class="dropOffActiveIndex === index + 1 ? 'bg-emerald-50/50' : 'hover:bg-emerald-50/50'">
                  <div class="text-sm font-medium transition-colors" :class="dropOffActiveIndex === index + 1 ? 'text-emerald-700' : 'text-slate-700 group-hover:text-emerald-700'">{{ stop }}</div>
                  <div class="text-[10px] text-slate-400 mt-0.5 truncate tracking-wide" title="運行系統">{{ stopRoutesMap[stop]?.join(", ") }}</div>
                </li>
              </ul>
            </div>
          </transition>
        </div>
        <!-- 補足メッセージ -->
        <p v-if="boardingStopInput && availableDropOffStops.length > 0" class="text-[10px] text-slate-400 mt-1.5 text-right tracking-wide">※反対方向のバスに乗る場合は、出発地と到着地を入れ替えてください</p>
      </div>

      <!-- 検索ボタン -->
      <button @click="handleSearch" :disabled="isLoading" class="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-2xl shadow-[0_8px_20px_rgb(5,150,105,0.2)] flex justify-center items-center gap-2 transition-all duration-300 disabled:opacity-70 disabled:active:scale-100">
        <Search class="w-4 h-4" />
        <span class="tracking-wide">検索</span>
      </button>
    </section>

    <!-- 統合時刻表リスト -->
    <section class="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-emerald-50/50 overflow-hidden">
      <div class="p-5 border-b border-slate-100 bg-[#f8fbf9] flex flex-col gap-4">
        <div class="flex justify-between items-center px-1">
          <h3 class="font-bold text-slate-700 flex items-center gap-2">
            <Clock class="w-4 h-4 text-emerald-500" />
            時刻表
          </h3>
          <span v-if="selectedDropOffStop" class="text-[10px] bg-emerald-100/80 text-emerald-700 px-3 py-1 rounded-full font-bold tracking-wide border border-emerald-200/50 shadow-sm"> {{ selectedDropOffStop }} まで </span>
        </div>

        <!-- 表示順序切り替えスイッチ (Pill style) -->
        <div class="flex bg-slate-200/60 p-1.5 rounded-[1.25rem] relative">
          <div class="absolute inset-y-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-transform duration-300 ease-out" :class="sortType === 'estimated' ? 'left-1.5 translate-x-0' : 'left-[calc(50%+4.5px)] translate-x-0'"></div>

          <button @click="sortType = 'estimated'" class="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-colors relative z-10" :class="sortType === 'estimated' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'">
            <Clock class="w-3.5 h-3.5" />
            予測順 <span class="hidden sm:inline">(遅延反映)</span>
          </button>
          <button @click="sortType = 'scheduled'" class="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-colors relative z-10" :class="sortType === 'scheduled' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'">
            <CalendarClock class="w-3.5 h-3.5" />
            定刻順 <span class="hidden sm:inline">(ダイヤ通り)</span>
          </button>
        </div>
      </div>

      <div class="divide-y divide-slate-100 max-h-[28rem] overflow-y-auto px-2 pb-2 pt-1 scrollbar-thin">
        <template v-for="(bus, index) in integratedTimetable" :key="`${bus.routeId}-${index}`">
          <!-- 過ぎたバスはリストに表示しない（次発が先頭に来るように） -->
          <div v-if="!(bus.isPast && index !== nextBusIndex)" class="p-3 my-1 rounded-2xl flex justify-between items-center transition-all duration-300" :class="index === nextBusIndex ? 'bg-emerald-50/80 border border-emerald-100 shadow-sm' : 'hover:bg-slate-50 border border-transparent hover:border-slate-100'">
            <div class="flex items-start gap-4 w-full px-2">
              <!-- 時刻表示部 -->
              <div class="flex flex-col items-center min-w-[4.5rem] pt-0.5">
                <template v-if="sortType === 'estimated'">
                  <span class="text-2xl font-black tabular-nums leading-none tracking-tight" :class="index === nextBusIndex ? 'text-emerald-800' : 'text-slate-700'">
                    {{ bus.estimatedTime.slice(0, 5) }}
                  </span>
                  <span class="text-[10px] text-slate-400 mt-1.5 font-medium tracking-wide"> 定刻 {{ bus.scheduledTime }} </span>
                </template>
                <template v-else>
                  <span class="text-2xl font-black tabular-nums leading-none tracking-tight" :class="index === nextBusIndex ? 'text-emerald-800' : 'text-slate-700'">
                    {{ bus.scheduledTime }}
                  </span>
                  <span class="text-[10px] text-slate-400 mt-1.5 font-medium tracking-wide"> 予測 {{ bus.estimatedTime.slice(0, 5) }} </span>
                </template>
              </div>

              <!-- 系統・行先情報 -->
              <div class="flex-1 min-w-0 pt-0.5">
                <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                  <!-- 会社バッジ -->
                  <span class="text-[9px] font-bold px-2 py-0.5 rounded-full text-white shadow-sm" :class="bus.company === 'Kokusai' ? 'bg-[#009140]' : 'bg-cyan-600'">
                    {{ bus.company === "Kokusai" ? "国際" : "西武" }}
                  </span>

                  <!-- 系統コードバッジ -->
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white shadow-sm" :class="[bus.textColor, bus.borderColor]">
                    {{ bus.routeCode }}
                  </span>

                  <!-- 遅延情報バッジ -->
                  <span v-if="bus.delay > 0" class="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-100 shadow-sm"> +{{ bus.delay }}分 </span>

                  <!-- まもなく表示 -->
                  <span v-if="index === nextBusIndex" class="ml-auto text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-sm animate-pulse whitespace-nowrap"> 先発 </span>
                </div>

                <div class="flex items-center text-slate-700 font-medium truncate mt-1">
                  <span class="truncate text-base"> {{ bus.destination }} <span class="text-xs text-slate-400 font-normal ml-0.5">行</span> </span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <div v-if="integratedTimetable.length > 0 && integratedTimetable.every(b => b.isPast)" class="p-10 text-center text-slate-400 text-sm font-medium">表示できるバスがありません</div>
        <div v-if="integratedTimetable.length === 0" class="p-10 text-center text-slate-400 text-sm font-medium">この区間の運行はありません</div>
      </div>
    </section>
  </main>
</template>
<script setup lang="ts">
  import { Bus, Clock, AlertTriangle, MapPin, ChevronDown, ArrowLeftRight, CalendarClock, Search, X } from "lucide-vue-next";
  import { useBusTimetable } from "@/composables/bus/useBusTimetable";

  const {
    // ステート
    boardingStopInput,
    dropOffStopInput,
    selectedDropOffStop,
    currentTime,
    lastUpdated,
    isLoading,
    sortType,
    isBoardingDropdownOpen,
    isDropOffDropdownOpen,
    boardingActiveIndex,
    dropOffActiveIndex,

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
    selectBoardingStop,
    selectDropOffStop,
    handleBoardingKeyDown,
    handleDropOffKeyDown,
    swapStops,

    // ユーティリティ
    formatTime,
  } = useBusTimetable();
</script>

