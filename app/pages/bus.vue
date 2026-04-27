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
          <span class="font-bold text-xl tracking-wide drop-shadow-sm">{{ nextBus.destination }} <span class="text-sm font-medium opacity-80">行</span></span>
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
      <!-- 乗車バス停 -->
      <div>
        <label class="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
          <div class="p-1 bg-blue-50 rounded-full"><MapPin class="w-3 h-3 text-blue-500" /></div>
          乗車バス停 (出発)
        </label>
        <div class="relative group">
          <input type="text" v-model="boardingStopInput" @focus="isBoardingDropdownOpen = true" @click="isBoardingDropdownOpen = true" @blur="isBoardingDropdownOpen = false" @keydown="handleBoardingKeyDown" placeholder="バス停名を入力または選択" class="w-full p-3.5 pl-4 pr-10 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium text-slate-700 transition-all duration-300" autocomplete="off" />
          <ChevronDown class="w-5 h-5 text-slate-400 absolute right-4 top-4 pointer-events-none transition-transform duration-300 group-focus-within:text-emerald-500" :class="{ 'rotate-180': isBoardingDropdownOpen }" />

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

      <!-- 降車バス停 (任意) -->
      <div>
        <label class="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
          <div class="p-1 bg-red-50 rounded-full"><MapPin class="w-3 h-3 text-red-500" /></div>
          降車バス停 (到着・任意)
        </label>
        <div class="relative group">
          <input type="text" v-model="dropOffStopInput" @focus="isDropOffDropdownOpen = true" @click="isDropOffDropdownOpen = true" @blur="isDropOffDropdownOpen = false" @keydown="handleDropOffKeyDown" :disabled="availableDropOffStops.length === 0" placeholder="指定なし (すべての行き先を表示)" class="w-full p-3.5 pl-4 pr-10 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium text-slate-700 disabled:bg-slate-100/50 disabled:text-slate-400 disabled:opacity-60 transition-all duration-300" autocomplete="off" />
          <ChevronDown class="w-5 h-5 text-slate-400 absolute right-4 top-4 pointer-events-none transition-transform duration-300 group-focus-within:text-emerald-500" :class="{ 'rotate-180': isDropOffDropdownOpen }" />

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
        <p v-if="boardingStopInput && availableDropOffStops.length > 0" class="text-[10px] text-slate-400 mt-1.5 text-right tracking-wide">※ 逆方向のバスに乗る場合は、乗車バス停を変更してください</p>
      </div>

      <!-- 検索ボタン -->
      <button @click="handleSearch" :disabled="isLoading" class="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-2xl shadow-[0_8px_20px_rgb(5,150,105,0.2)] flex justify-center items-center gap-2 transition-all duration-300 disabled:opacity-70 disabled:active:scale-100">
        <Search class="w-4 h-4" />
        <span class="tracking-wide">検索して表示</span>
      </button>
    </section>

    <!-- 統合時刻表リスト -->
    <section class="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-emerald-50/50 overflow-hidden">
      <div class="p-5 border-b border-slate-100 bg-[#f8fbf9] flex flex-col gap-4">
        <div class="flex justify-between items-center px-1">
          <h3 class="font-bold text-slate-700 flex items-center gap-2">
            <Filter class="w-4 h-4 text-emerald-500" />
            通過予定リスト
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
                  <div class="flex flex-col items-center mt-1.5">
                    <span class="text-[10px] text-slate-400 font-medium tracking-wide"> 予測 {{ bus.estimatedTime.slice(0, 5) }} </span>
                    <span v-if="bus.delay > 0" class="text-[9px] text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded-sm mt-0.5 shadow-sm border border-red-100"> +{{ bus.delay }}分 </span>
                  </div>
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

                  <!-- 遅延情報バッジ (予測順の時はここに表示) -->
                  <span v-if="sortType === 'estimated' && bus.delay > 0" class="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-100 shadow-sm"> +{{ bus.delay }}分 </span>

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
  import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
  import { Bus, Clock, AlertTriangle, MapPin, ChevronDown, Filter, ArrowLeftRight, CalendarClock, Search } from "lucide-vue-next";

  // --- データ定義 ---

  // 頂いたデータを元に構築
  const KOKUSAI_ROUTES_DATA = {
    "北浦03": [
      { id: "00021176", name: "北浦和駅西口" },
      { id: "00021222", name: "常磐十丁目" },
      { id: "00021200", name: "大戸小学校" },
      { id: "00021223", name: "鈴谷小学校" },
      { id: "00021224", name: "南与野駅北入口" },
      { id: "00021225", name: "鈴谷札の辻" },
      { id: "00021226", name: "山久保" },
      { id: "00021227", name: "栄和北町" },
      { id: "00021228", name: "大泉院通り" },
      { id: "00021229", name: "埼玉大学" }
    ],
    "南与01": [
      { id: "00021362", name: "南与野駅西口" },
      { id: "00021225", name: "鈴谷札の辻" },
      { id: "00021226", name: "山久保" },
      { id: "00021227", name: "栄和北町" },
      { id: "00021228", name: "大泉院通り" },
      { id: "00021229", name: "埼玉大学" }
    ],
    "南与02": [
      { id: "00021362", name: "南与野駅西口" },
      { id: "00021225", name: "鈴谷札の辻" },
      { id: "00021226", name: "山久保" },
      { id: "00021227", name: "栄和北町" },
      { id: "00021228", name: "大泉院通り" },
      { id: "00021229", name: "埼玉大学" },
      { id: "00021529", name: "本村" },
      { id: "00021187", name: "下大久保" }
    ],
    "志03-3": [
      { id: "00021278", name: "志木駅東口" },
      { id: "00021279", name: "東町" },
      { id: "00021280", name: "双葉町" },
      { id: "00021281", name: "昭和新道" },
      { id: "00021282", name: "上町" },
      { id: "00021283", name: "富士道入口" },
      { id: "00021284", name: "市場坂上" },
      { id: "00021285", name: "志木市役所" },
      { id: "00021286", name: "いろは橋" },
      { id: "00021330", name: "中宗岡一丁目" },
      { id: "00021331", name: "志木高校入口" },
      { id: "00021332", name: "宿" },
      { id: "00021333", name: "上宗岡二丁目" },
      { id: "00021334", name: "宗岡蓮田" },
      { id: "00021187", name: "下大久保" },
      { id: "00021529", name: "本村" },
      { id: "00021229", name: "埼玉大学" },
      { id: "00021228", name: "大泉院通り" },
      { id: "00021227", name: "栄和北町" },
      { id: "00021226", name: "山久保" },
      { id: "00021225", name: "鈴谷札の辻" },
      { id: "00021362", name: "南与野駅西口" }
    ],
    "北朝02": [
      { id: "00021352", name: "北朝霞駅" },
      { id: "00021347", name: "宮戸橋" },
      { id: "00021346", name: "宗岡第三小学校" },
      { id: "00021345", name: "下宗岡一丁目" },
      { id: "00021343", name: "下宗岡二丁目" },
      { id: "00021290", name: "宗岡" },
      { id: "00021339", name: "中宗岡" },
      { id: "00021338", name: "中宗岡三丁目" },
      { id: "00021337", name: "氷川前" },
      { id: "00021336", name: "五反田" },
      { id: "00021335", name: "上宗岡四丁目" },
      { id: "00021334", name: "宗岡蓮田" },
      { id: "00021187", name: "下大久保" },
      { id: "00021529", name: "本村" },
      { id: "00021229", name: "埼玉大学" },
      { id: "00021228", name: "大泉院通り" },
      { id: "00021227", name: "栄和北町" },
      { id: "00021226", name: "山久保" },
      { id: "00021225", name: "鈴谷札の辻" },
      { id: "00021362", name: "南与野駅西口" }
    ],
    "浦11": [
      { id: "00021083", name: "浦和駅西口" },
      { id: "00021156", name: "県庁通り" },
      { id: "00021157", name: "埼玉会館" },
      { id: "00021158", name: "県庁前" },
      { id: "00021159", name: "附属中学校" },
      { id: "00021160", name: "別所沼公園" },
      { id: "00021161", name: "中浦和駅" },
      { id: "00021162", name: "関" },
      { id: "00021163", name: "田島" },
      { id: "00021164", name: "西堀" },
      { id: "00021165", name: "浦和工業高校" },
      { id: "00021166", name: "土合小学校" },
      { id: "00021167", name: "南元宿" },
      { id: "00021180", name: "町屋" },
      { id: "00021181", name: "町屋三丁目" },
      { id: "00021182", name: "栄和" },
      { id: "00021183", name: "道場" },
      { id: "00021184", name: "十石田" },
      { id: "00021360", name: "桜区役所" }
    ],
    "浦12": [
      { id: "00021083", name: "浦和駅西口" },
      { id: "00021084", name: "市民会館入口" },
      { id: "00021177", name: "常盤一丁目" },
      { id: "00021178", name: "常盤二丁目" },
      { id: "00021179", name: "常盤四丁目" },
      { id: "00021173", name: "六間道路(浦和区)" },
      { id: "00021172", name: "市役所北口(さいたま市)" },
      { id: "00021171", name: "水道局前" },
      { id: "00021170", name: "大戸" },
      { id: "00021169", name: "西戸橋" },
      { id: "00021168", name: "日向" },
      { id: "00021167", name: "南元宿" },
      { id: "00021180", name: "町屋" },
      { id: "00021181", name: "町屋三丁目" },
      { id: "00021182", name: "栄和" },
      { id: "00021183", name: "道場" },
      { id: "00021184", name: "十石田" },
      { id: "00021360", name: "桜区役所" }
    ],
    "浦12-2": [
      { id: "00021083", name: "浦和駅西口" },
      { id: "00021084", name: "市民会館入口" },
      { id: "00021234", name: "仲町三丁目(浦和区)" },
      { id: "00021230", name: "市役所前(さいたま市)" },
      { id: "00021173", name: "六間道路(浦和区)" },
      { id: "00021172", name: "市役所北口(さいたま市)" },
      { id: "00021171", name: "水道局前" },
      { id: "00021170", name: "大戸" },
      { id: "00021169", name: "西戸橋" },
      { id: "00021168", name: "日向" },
      { id: "00021167", name: "南元宿" },
      { id: "00021180", name: "町屋" },
      { id: "00021181", name: "町屋三丁目" },
      { id: "00021182", name: "栄和" },
      { id: "00021183", name: "道場" },
      { id: "00021184", name: "十石田" },
      { id: "00021360", name: "桜区役所" }
    ],
    "浦13": [
      { id: "00021083", name: "浦和駅西口" },
      { id: "00021084", name: "市民会館入口" },
      { id: "00021177", name: "常盤一丁目" },
      { id: "00021178", name: "常盤二丁目" },
      { id: "00021179", name: "常盤四丁目" },
      { id: "00021173", name: "六間道路(浦和区)" },
      { id: "00021172", name: "市役所北口(さいたま市)" },
      { id: "00021171", name: "水道局前" },
      { id: "00021170", name: "大戸" },
      { id: "00021169", name: "西戸橋" },
      { id: "00021168", name: "日向" },
      { id: "00021167", name: "南元宿" },
      { id: "00021180", name: "町屋" },
      { id: "00021181", name: "町屋三丁目" },
      { id: "00021182", name: "栄和" },
      { id: "00021183", name: "道場" },
      { id: "00021184", name: "十石田" },
      { id: "00021185", name: "埼大裏" },
      { id: "00021186", name: "諏訪前橋" },
      { id: "00021187", name: "下大久保" },
      { id: "00021188", name: "中島" },
      { id: "00021189", name: "浦和北高校" },
      { id: "00021190", name: "大久保支所" },
      { id: "00021191", name: "塚本" },
      { id: "00021192", name: "やつしまニュータウン" },
      { id: "00021193", name: "大久保浄水場" }
    ],
    "浦13-2": [
      { id: "00021083", name: "浦和駅西口" },
      { id: "00021084", name: "市民会館入口" },
      { id: "00021177", name: "常盤一丁目" },
      { id: "00021178", name: "常盤二丁目" },
      { id: "00021179", name: "常盤四丁目" },
      { id: "00021173", name: "六間道路(浦和区)" },
      { id: "00021172", name: "市役所北口(さいたま市)" },
      { id: "00021171", name: "水道局前" },
      { id: "00021170", name: "大戸" },
      { id: "00021169", name: "西戸橋" },
      { id: "00021168", name: "日向" },
      { id: "00021167", name: "南元宿" },
      { id: "00021180", name: "町屋" },
      { id: "00021181", name: "町屋三丁目" },
      { id: "00021182", name: "栄和" },
      { id: "00021183", name: "道場" },
      { id: "00021184", name: "十石田" },
      { id: "00021185", name: "埼大裏" },
      { id: "00021186", name: "諏訪前橋" },
      { id: "00021187", name: "下大久保" }
    ],
    "浦桜13-3": [
      { id: "00021083", name: "浦和駅西口" },
      { id: "00021084", name: "市民会館入口" },
      { id: "00021234", name: "仲町三丁目(浦和区)" },
      { id: "00021230", name: "市役所前(さいたま市)" },
      { id: "00021173", name: "六間道路(浦和区)" },
      { id: "00021172", name: "市役所北口(さいたま市)" },
      { id: "00021171", name: "水道局前" },
      { id: "00021170", name: "大戸" },
      { id: "00021169", name: "西戸橋" },
      { id: "00021168", name: "日向" },
      { id: "00021167", name: "南元宿" },
      { id: "00021180", name: "町屋" },
      { id: "00021181", name: "町屋三丁目" },
      { id: "00021182", name: "栄和" },
      { id: "00021183", name: "道場" },
      { id: "00021184", name: "十石田" },
      { id: "00021360", name: "桜区役所" },
      { id: "00021185", name: "埼大裏" },
      { id: "00021186", name: "諏訪前橋" },
      { id: "00021187", name: "下大久保" },
      { id: "00021188", name: "中島" },
      { id: "00021189", name: "浦和北高校" },
      { id: "00021190", name: "大久保支所" },
      { id: "00021191", name: "塚本" },
      { id: "00021192", name: "やつしまニュータウン" },
      { id: "00021193", name: "大久保浄水場" }
    ],
    "浦15": [
      { id: "00021083", name: "浦和駅西口" },
      { id: "00021084", name: "市民会館入口" },
      { id: "00021234", name: "仲町三丁目(浦和区)" },
      { id: "00022226", name: "鯛ヶ窪橋" },
      { id: "00022227", name: "西堀高沼公園" },
      { id: "00022228", name: "西堀氷川トンネル" },
      { id: "00022229", name: "西堀五丁目" },
      { id: "00022230", name: "浦和市場入口" },
      { id: "00022231", name: "町屋四丁目" },
      { id: "00022232", name: "道場三丁目" },
      { id: "00021184", name: "十石田" },
      { id: "00021360", name: "桜区役所" }
    ]
  };

  const SEIBU_ROUTES_DATA = {
    北浦03: [
      { id: "00111628", name: "北浦和駅" },
      { id: "00111636", name: "常磐十丁目" },
      { id: "00111637", name: "大戸小学校" },
      { id: "00111638", name: "鈴谷小学校" },
      { id: "00111639", name: "南与野駅北入口" },
      { id: "00111640", name: "鈴谷札の辻" },
      { id: "00111641", name: "山久保" },
      { id: "00111642", name: "栄和北町" },
      { id: "00111647", name: "大泉院通り" },
      { id: "00111643", name: "埼玉大学" }
    ],
    南与01: [
      { id: "00111644", name: "南与野駅西口" },
      { id: "00111640", name: "鈴谷札の辻" },
      { id: "00111641", name: "山久保" },
      { id: "00111642", name: "栄和北町" },
      { id: "00111647", name: "大泉院通り" },
      { id: "00111643", name: "埼玉大学" }
    ]
  };

  // --- バス停よみがなマップ ---
  const STOP_KANA_MAP: Record<string, string> = {
    "北浦和駅西口": "きたうらわえきにしぐち",
    "常磐十丁目": "ときわじゅっちょうめ",
    "大戸小学校": "おおとしょうがっこう",
    "鈴谷小学校": "すずやしょうがっこう",
    "南与野駅北入口": "みなみよのえききたいりぐち",
    "鈴谷札の辻": "すずやふだのつじ",
    "山久保": "やまくぼ",
    "栄和北町": "さかわきたまち",
    "大泉院通り": "だいせんいんどおり",
    "埼玉大学": "さいたまだいがく",
    "南与野駅西口": "みなみよのえきにしぐち",
    "本村": "ほんむら",
    "下大久保": "しもおおくぼ",
    "志木駅東口": "しきえきひがしぐち",
    "東町": "ひがしちょう",
    "双葉町": "ふたばちょう",
    "昭和新道": "しょうわしんどう",
    "上町": "かみちょう",
    "富士道入口": "ふじどういりぐち",
    "市場坂上": "いちばさかうえ",
    "志木市役所": "しきしやくしょ",
    "いろは橋": "いろはばし",
    "中宗岡一丁目": "なかむねおかいっちょうめ",
    "志木高校入口": "しきこうこういりぐち",
    "宿": "しゅく",
    "上宗岡二丁目": "かみむねおかにちょうめ",
    "宗岡蓮田": "むねおかはすだ",
    "北朝霞駅": "きたあさかえき",
    "宮戸橋": "みやとばし",
    "宗岡第三小学校": "むねおかだいさんしょうがっこう",
    "下宗岡一丁目": "しもむねおかいっちょうめ",
    "下宗岡二丁目": "しもむねおかにちょうめ",
    "宗岡": "むねおか",
    "中宗岡": "なかむねおか",
    "中宗岡三丁目": "なかむねおかさんちょうめ",
    "氷川前": "ひかわまえ",
    "五反田": "ごたんだ",
    "上宗岡四丁目": "かみむねおかよんちょうめ",
    "浦和駅西口": "うらわえきにしぐち",
    "県庁通り": "けんちょうどおり",
    "埼玉会館": "さいたまかいかん",
    "県庁前": "けんちょうまえ",
    "附属中学校": "ふぞくちゅうがっこう",
    "別所沼公園": "べっしょぬまこうえん",
    "中浦和駅": "なかうらわえき",
    "関": "せき",
    "田島": "たじま",
    "西堀": "にしぼり",
    "浦和工業高校": "うらわこうぎょうこうこう",
    "土合小学校": "つちあいしょうがっこう",
    "南元宿": "みなみもとじゅく",
    "町屋": "まちや",
    "町屋三丁目": "まちやさんちょうめ",
    "栄和": "さかわ",
    "道場": "どうじょう",
    "十石田": "じゅっこくだ",
    "桜区役所": "さくらくやくしょ",
    "市民会館入口": "しみんかいかんいりぐち",
    "常盤一丁目": "ときわいっちょうめ",
    "常盤二丁目": "ときわにちょうめ",
    "常盤四丁目": "ときわよんちょうめ",
    "六間道路(浦和区)": "ろっけんどうろ",
    "市役所北口(さいたま市)": "しやくしょきたぐち",
    "水道局前": "すいどうきょくまえ",
    "大戸": "おおと",
    "西戸橋": "にしどばし",
    "日向": "ひなた",
    "仲町三丁目(浦和区)": "なかちょうさんちょうめ",
    "市役所前(さいたま市)": "しやくしょまえ",
    "埼大裏": "さいだいうら",
    "諏訪前橋": "すわまえばし",
    "中島": "なかじま",
    "浦和北高校": "うらわきたこうこう",
    "大久保支所": "おおくぼししょ",
    "塚本": "つかもと",
    "やつしまニュータウン": "やつしまにゅーたうん",
    "大久保浄水場": "おおくぼじょうすいじょう",
    "鯛ヶ窪橋": "たいがくぼばし",
    "西堀高沼公園": "にしぼりこうぬまこうえん",
    "西堀氷川トンネル": "にしぼりひかわとんねる",
    "西堀五丁目": "にしぼりごちょうめ",
    "浦和市場入口": "うらわいちばいりぐち",
    "町屋四丁目": "まちやよんちょうめ",
    "道場三丁目": "どうじょうさんちょうめ",
    "北浦和駅": "きたうらわえき"
  };

  // シミュレーション用の仮時刻表パターン (各系統共通で時間だけずらす)
  const BASE_SCHEDULE_TEMPLATE = ["06:10", "06:25", "06:40", "06:55", "07:05", "07:15", "07:25", "07:35", "07:45", "07:55", "08:05", "08:15", "08:25", "08:40", "08:55", "09:10", "09:25", "09:40", "09:55", "10:15", "10:45", "11:15", "11:45", "12:15", "12:45", "13:15", "13:45", "14:15", "14:45", "15:05", "15:25", "15:45", "16:05", "16:20", "16:35", "16:50", "17:05", "17:15", "17:30", "17:45", "18:00", "18:15", "18:30", "18:45", "19:00", "19:15", "19:30", "19:50", "20:10", "20:30", "20:50", "21:20", "21:50"];

  // 時間を少しずらす関数（系統が重なった時に見やすくするため）
  const shiftSchedule = (schedule: string[], minutes: number) => {
    return schedule.map(time => {
      const [h, m] = time.split(":").map(Number);
      const date = new Date();
      date.setHours(h, m + minutes, 0, 0);
      return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
    });
  };

  // データをアプリで扱いやすい形式に変換 (往復ルート生成)
  const GENERATED_ROUTES: any[] = [];

  // ルート生成ヘルパー関数: 指定されたバス停リストから往路・復路を生成
  const createRouteVariants = (companyPrefix: string, code: string, stops: any[], baseScheduleTemplate: string[], indexOffset: number) => {
    const routes = [];
    const company = companyPrefix === "kk" ? "Kokusai" : "Seibu";

    // スタイル定義
    const styles =
      company === "Kokusai"
        ? {
            color: "bg-green-700",
            textColor: "text-green-700",
            borderColor: "border-green-700"
          }
        : {
            color: "bg-cyan-600",
            textColor: "text-cyan-600",
            borderColor: "border-cyan-600"
          };

    // 1. 往路 (Outbound)
    routes.push({
      id: `${companyPrefix}_${code}_out`,
      code: code,
      company: company,
      name: `${code}: ${stops[0].name} → ${stops[stops.length - 1].name}`,
      destination: stops[stops.length - 1].name,
      ...styles,
      stops: stops.map((s, i) => ({ name: s.name, offset: i * 2 })),
      baseSchedule: shiftSchedule(baseScheduleTemplate, indexOffset)
    });

    // 2. 復路 (Inbound) - 逆順
    const reversedStops = [...stops].reverse();
    routes.push({
      id: `${companyPrefix}_${code}_in`,
      code: code,
      company: company,
      name: `${code}: ${reversedStops[0].name} → ${reversedStops[reversedStops.length - 1].name}`,
      destination: reversedStops[reversedStops.length - 1].name, // 逆方向の終点
      ...styles,
      stops: reversedStops.map((s, i) => ({ name: s.name, offset: i * 2 })),
      // 復路は少し時間をずらす (例: +15分) - これにより往路・復路のバスが団子にならないようにする
      baseSchedule: shiftSchedule(baseScheduleTemplate, indexOffset + 15)
    });

    return routes;
  };

  // 国際興業バスの変換
  Object.entries(KOKUSAI_ROUTES_DATA).forEach(([code, stops], index) => {
    const variants = createRouteVariants("kk", code, stops, BASE_SCHEDULE_TEMPLATE, index * 3);
    GENERATED_ROUTES.push(...variants);
  });

  // 西武バスの変換
  Object.entries(SEIBU_ROUTES_DATA).forEach(([code, stops], index) => {
    const variants = createRouteVariants("seibu", code, stops, BASE_SCHEDULE_TEMPLATE, index * 7 + 2);
    GENERATED_ROUTES.push(...variants);
  });

  // --- ヘルパー関数 ---

  const parseTime = (timeStr: string, baseDate = new Date()) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  };

  const addMinutes = (date: Date, minutes: number) => {
    return new Date(date.getTime() + minutes * 60000);
  };

  // --- Vue コンポーネントロジック ---

  // UI入力用 (検索ボタンを押すまで確定しない)
  const boardingStopInput = ref("南与野駅西口");
  const dropOffStopInput = ref("");

  // 確定した検索条件
  const selectedBoardingStop = ref("南与野駅西口");
  const selectedDropOffStop = ref("");

  const busDelays = ref<Record<string, number>>({});
  const currentTime = ref(new Date());
  const lastUpdated = ref(new Date());
  const isLoading = ref(false);
  const sortType = ref("estimated"); // 'estimated' | 'scheduled'

  // 全バス停のユニークリスト
  const allStops = computed(() => {
    const stopsSet = new Set<string>();
    GENERATED_ROUTES.forEach(route => {
      route.stops.forEach((stop: any) => stopsSet.add(stop.name));
    });
    return Array.from(stopsSet).sort((a, b) => {
      const priority = ["埼玉大学", "北浦和駅西口", "南与野駅西口", "南与野駅北入口", "志木駅東口", "北朝霞駅", "浦和駅西口"];
      const indexA = priority.indexOf(a);
      const indexB = priority.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b, "ja");
    });
  });

  // 現在時刻の更新タイマー
  let timer: ReturnType<typeof setInterval>;
  onMounted(() => {
    timer = setInterval(() => {
      currentTime.value = new Date();
    }, 1000);

    // 初回データロード
    refreshData();
  });

  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });

  // 選択可能な降車バス停リスト (Input値に基づいて計算)
  const availableDropOffStops = computed(() => {
    const possibleStops = new Set<string>();
    GENERATED_ROUTES.forEach(route => {
      const boardingIndex = route.stops.findIndex((s: any) => s.name === boardingStopInput.value); // Inputを使用
      if (boardingIndex !== -1 && boardingIndex < route.stops.length - 1) {
        for (let i = boardingIndex + 1; i < route.stops.length; i++) {
          possibleStops.add(route.stops[i].name);
        }
      }
    });
    return Array.from(possibleStops).sort((a, b) => a.localeCompare(b, "ja"));
  });

  // データの更新シミュレーション
  const refreshData = () => {
    isLoading.value = true;
    setTimeout(() => {
      const newDelays: Record<string, number> = {};

      GENERATED_ROUTES.forEach(route => {
        route.baseSchedule.forEach((timeStr: string) => {
          const busId = `${route.id}_${timeStr}`;
          if (Math.random() < 0.3) {
            newDelays[busId] = Math.floor(Math.random() * 25) + 1;
          }
        });
      });

      busDelays.value = newDelays;
      lastUpdated.value = new Date();
      isLoading.value = false;
    }, 600);
  };

  // 検索実行
  const handleSearch = () => {
    selectedBoardingStop.value = boardingStopInput.value;
    selectedDropOffStop.value = dropOffStopInput.value;
    refreshData();
  };

  // 統合時刻表データ (確定済みStateに基づいて計算)
  const integratedTimetable = computed(() => {
    let allBuses: any[] = [];

    GENERATED_ROUTES.forEach(route => {
      const boardingStopIndex = route.stops.findIndex((s: any) => s.name === selectedBoardingStop.value);
      if (boardingStopIndex === -1) return;

      if (selectedDropOffStop.value) {
        const dropOffStopIndex = route.stops.findIndex((s: any) => s.name === selectedDropOffStop.value);
        if (dropOffStopIndex === -1 || dropOffStopIndex <= boardingStopIndex) return;
      }

      const boardingStopInfo = route.stops[boardingStopIndex];

      const routeBuses = route.baseSchedule.map((timeStr: string) => {
        const originDate = parseTime(timeStr, currentTime.value);
        const stopScheduledDate = addMinutes(originDate, boardingStopInfo.offset);

        const busId = `${route.id}_${timeStr}`;
        const delay = busDelays.value[busId] || 0;

        const estimatedDate = addMinutes(stopScheduledDate, delay);
        const isPast = estimatedDate < currentTime.value;

        return {
          routeId: route.id,
          routeCode: route.code,
          routeName: route.name,
          routeColor: route.color,
          textColor: route.textColor,
          borderColor: route.borderColor,
          company: route.company,
          destination: route.destination,
          scheduledTime: formatTime(stopScheduledDate).slice(0, 5),
          estimatedTime: formatTime(estimatedDate),
          delay: delay,
          scheduledDate: stopScheduledDate,
          estimatedDate: estimatedDate,
          isPast: isPast,
          boardingStopName: selectedBoardingStop.value
        };
      });
      allBuses = [...allBuses, ...routeBuses];
    });

    return allBuses.sort((a, b) => {
      if (sortType.value === "estimated") {
        return a.estimatedDate.getTime() - b.estimatedDate.getTime();
      } else {
        return a.scheduledDate.getTime() - b.scheduledDate.getTime();
      }
    });
  });

  const nextBusIndex = computed(() => integratedTimetable.value.findIndex(item => !item.isPast));
  const nextBus = computed(() => (nextBusIndex.value !== -1 ? integratedTimetable.value[nextBusIndex.value] : null));

  const hasDelayInUpcoming = computed(() => {
    const startIndex = nextBusIndex.value !== -1 ? nextBusIndex.value : 0;
    return integratedTimetable.value.slice(startIndex).some(bus => bus.delay > 0);
  });

  // カスタムドロップダウン用
  const isBoardingDropdownOpen = ref(false);
  const isDropOffDropdownOpen = ref(false);

  // カタカナをひらがなに変換し、大文字小文字を統一するヘルパー
  const normalizeKana = (str: string) => {
    return str.replace(/[\u30a1-\u30f6]/g, match => String.fromCharCode(match.charCodeAt(0) - 0x60)).toLowerCase();
  };

  const getStopKana = (stopName: string) => {
    return STOP_KANA_MAP[stopName] || "";
  };

  // ひらがな -> ローマ字(訓令式ベース) 変換マップ
  const KANA_TO_ROMAJI_MAP: Record<string, string> = {
    あ: "a",
    い: "i",
    う: "u",
    え: "e",
    お: "o",
    か: "ka",
    き: "ki",
    く: "ku",
    け: "ke",
    こ: "ko",
    さ: "sa",
    し: "si",
    す: "su",
    せ: "se",
    そ: "so",
    た: "ta",
    ち: "ti",
    つ: "tu",
    て: "te",
    と: "to",
    な: "na",
    に: "ni",
    ぬ: "nu",
    ね: "ne",
    の: "no",
    は: "ha",
    ひ: "hi",
    ふ: "hu",
    へ: "he",
    ほ: "ho",
    ま: "ma",
    み: "mi",
    む: "mu",
    me: "め",
    も: "mo",
    や: "ya",
    ゆ: "yu",
    よ: "yo",
    ら: "ra",
    り: "ri",
    る: "ru",
    れ: "re",
    ろ: "ro",
    わ: "wa",
    を: "o",
    ん: "n",
    が: "ga",
    ぎ: "gi",
    ぐ: "gu",
    げ: "ge",
    ご: "go",
    ざ: "za",
    じ: "zi",
    ず: "zu",
    ぜ: "ze",
    ぞ: "zo",
    だ: "da",
    ぢ: "zi",
    づ: "zu",
    で: "de",
    ど: "do",
    ば: "ba",
    び: "bi",
    ぶ: "bu",
    べ: "be",
    ぼ: "bo",
    ぱ: "pa",
    ぴ: "pi",
    ぷ: "pu",
    ぺ: "pe",
    ぽ: "po",
    きゃ: "kya",
    きゅ: "kyu",
    きょ: "kyo",
    しゃ: "sya",
    しゅ: "syu",
    しょ: "syo",
    ちゃ: "tya",
    ちゅ: "tyu",
    ちょ: "tyo",
    にゃ: "nya",
    にゅ: "nyu",
    にょ: "nyo",
    ひゃ: "hya",
    ひゅ: "hyu",
    ひょ: "hyo",
    みゃ: "mya",
    みゅ: "myu",
    みょ: "myo",
    りゃ: "rya",
    りゅ: "ryu",
    りょ: "ryo",
    ぎゃ: "gya",
    ぎゅ: "gyu",
    ぎょ: "gyo",
    じゃ: "zya",
    じゅ: "zyu",
    じょ: "zyo",
    びゃ: "bya",
    びゅ: "byu",
    びょ: "byo",
    ぴゃ: "pya",
    ぴゅ: "pyu",
    ぴょ: "pyo",
    っ: "t",
    ー: "-"
  };

  // ひらがなを正規化されたローマ字に変換
  const kanaToRomaji = (kana: string) => {
    let romaji = "";
    for (let i = 0; i < kana.length; i++) {
      if (i < kana.length - 1) {
        const twoChar = kana.substring(i, i + 2);
        if (KANA_TO_ROMAJI_MAP[twoChar]) {
          romaji += KANA_TO_ROMAJI_MAP[twoChar];
          i++;
          continue;
        }
      }
      const c = kana[i];
      if (c === "っ") {
        if (i < kana.length - 1) {
          const nextTwoChar = kana.substring(i + 1, i + 3);
          const nextChar = kana[i + 1];
          const nextRomaji = KANA_TO_ROMAJI_MAP[nextTwoChar] || KANA_TO_ROMAJI_MAP[nextChar];
          if (nextRomaji) {
            romaji += nextRomaji[0]; // 子音を重ねる
          } else {
            romaji += "t";
          }
        }
        continue;
      }
      romaji += KANA_TO_ROMAJI_MAP[c] || c;
    }
    // 長音の揺れを吸収 (ou -> o, uu -> u, oo -> o)
    return romaji.replace(/ou/g, "o").replace(/uu/g, "u").replace(/oo/g, "o");
  };

  // バス停のローマ字表現を取得
  const getStopRomaji = (stopName: string) => {
    return kanaToRomaji(getStopKana(stopName));
  };

  // ユーザーの入力したローマ字クエリを正規化 (ヘボン式を訓令式に、長音を吸収)
  const normalizeRomajiQuery = (query: string) => {
    return query.toLowerCase().replace(/shi/g, "si").replace(/chi/g, "ti").replace(/tsu/g, "tu").replace(/fu/g, "hu").replace(/ji/g, "zi").replace(/sha/g, "sya").replace(/shu/g, "syu").replace(/sho/g, "syo").replace(/cha/g, "tya").replace(/chu/g, "tyu").replace(/cho/g, "tyo").replace(/ja/g, "zya").replace(/ju/g, "zyu").replace(/jo/g, "zyo").replace(/ou/g, "o").replace(/uu/g, "u").replace(/oo/g, "o").replace(/tch/g, "tt");
  };

  const filteredBoardingStops = computed(() => {
    if (!boardingStopInput.value) return allStops.value;
    const searchWord = normalizeKana(boardingStopInput.value);
    const searchRomaji = normalizeRomajiQuery(boardingStopInput.value);

    return allStops.value.filter(stop => normalizeKana(stop).includes(searchWord) || getStopKana(stop).includes(searchWord) || (searchRomaji.length > 0 && getStopRomaji(stop).includes(searchRomaji)));
  });

  const filteredDropOffStops = computed(() => {
    if (!dropOffStopInput.value) return availableDropOffStops.value;
    const searchWord = normalizeKana(dropOffStopInput.value);
    const searchRomaji = normalizeRomajiQuery(dropOffStopInput.value);

    return availableDropOffStops.value.filter(stop => normalizeKana(stop).includes(searchWord) || getStopKana(stop).includes(searchWord) || (searchRomaji.length > 0 && getStopRomaji(stop).includes(searchRomaji)));
  });

  // バス停ごとの通過系統マップ (サジェストのガイド用)
  const stopRoutesMap = computed(() => {
    const map: Record<string, string[]> = {};
    GENERATED_ROUTES.forEach(route => {
      route.stops.forEach((s: any) => {
        if (!map[s.name]) {
          map[s.name] = [];
        }
        if (!map[s.name].includes(route.code)) {
          map[s.name].push(route.code);
        }
      });
    });
    for (const stop in map) {
      map[stop].sort();
    }
    return map;
  });

  const selectBoardingStop = (stop: string) => {
    boardingStopInput.value = stop;
    isBoardingDropdownOpen.value = false;
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const selectDropOffStop = (stop: string) => {
    dropOffStopInput.value = stop;
    isDropOffDropdownOpen.value = false;
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  // 入力変更時のリセットと開閉制御
  watch(boardingStopInput, (newVal, oldVal) => {
    boardingActiveIndex.value = -1;
    if (newVal !== oldVal) {
      dropOffStopInput.value = "";
    }
  });

  watch(dropOffStopInput, () => {
    dropOffActiveIndex.value = -1;
  });

  const boardingActiveIndex = ref(-1);
  const dropOffActiveIndex = ref(-1);

  const scrollToActiveElement = (containerId: string, elementId: string) => {
    nextTick(() => {
      const container = document.getElementById(containerId);
      const element = document.getElementById(elementId);
      if (container && element) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        if (elementRect.bottom > containerRect.bottom) {
          container.scrollTop += elementRect.bottom - containerRect.bottom;
        } else if (elementRect.top < containerRect.top) {
          container.scrollTop -= containerRect.top - elementRect.top;
        }
      }
    });
  };

  const handleBoardingKeyDown = (e: KeyboardEvent) => {
    if (!isBoardingDropdownOpen.value) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        isBoardingDropdownOpen.value = true;
      }
      return;
    }

    const maxIndex = filteredBoardingStops.value.length - 1;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      boardingActiveIndex.value = boardingActiveIndex.value < maxIndex ? boardingActiveIndex.value + 1 : 0;
      scrollToActiveElement("boarding-dropdown-container", `boarding-stop-${boardingActiveIndex.value}`);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      boardingActiveIndex.value = boardingActiveIndex.value > 0 ? boardingActiveIndex.value - 1 : maxIndex;
      scrollToActiveElement("boarding-dropdown-container", `boarding-stop-${boardingActiveIndex.value}`);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (boardingActiveIndex.value >= 0 && boardingActiveIndex.value <= maxIndex) {
        selectBoardingStop(filteredBoardingStops.value[boardingActiveIndex.value]);
      }
    } else if (e.key === "Escape") {
      isBoardingDropdownOpen.value = false;
    }
  };

  const handleDropOffKeyDown = (e: KeyboardEvent) => {
    if (!isDropOffDropdownOpen.value) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        isDropOffDropdownOpen.value = true;
      }
      return;
    }

    const items = ["", ...filteredDropOffStops.value];
    const maxIndex = items.length - 1;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      dropOffActiveIndex.value = dropOffActiveIndex.value < maxIndex ? dropOffActiveIndex.value + 1 : 0;
      scrollToActiveElement("dropoff-dropdown-container", `dropoff-stop-${dropOffActiveIndex.value}`);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      dropOffActiveIndex.value = dropOffActiveIndex.value > 0 ? dropOffActiveIndex.value - 1 : maxIndex;
      scrollToActiveElement("dropoff-dropdown-container", `dropoff-stop-${dropOffActiveIndex.value}`);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (dropOffActiveIndex.value >= 0 && dropOffActiveIndex.value <= maxIndex) {
        selectDropOffStop(items[dropOffActiveIndex.value]);
      }
    } else if (e.key === "Escape") {
      isDropOffDropdownOpen.value = false;
    }
  };

  const swapStops = () => {
    if (dropOffStopInput.value) {
      const temp = boardingStopInput.value;
      boardingStopInput.value = dropOffStopInput.value;
      dropOffStopInput.value = temp;
    }
  };
</script>
