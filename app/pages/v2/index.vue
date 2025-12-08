<template>
  <div class="min-h-screen bg-gray-50 text-gray-800 font-sans pb-16">
    <!-- ヘッダー -->
    <header class="bg-slate-800 text-white shadow-md sticky top-0 z-50">
      <div class="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <Bus class="w-6 h-6" />
          <h1 class="text-lg font-bold tracking-wider">わかめナビ🌱</h1>
        </div>

        <button v-if="currentView === 'timetable'" @click="refreshData" :disabled="isLoading" class="p-2 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50" aria-label="更新">
          <RefreshCw class="w-5 h-5" :class="{ 'animate-spin': isLoading }" />
        </button>
      </div>
    </header>

    <!-- メインコンテンツエリア -->
    <main class="max-w-md mx-auto px-4 py-6 space-y-6">
      <!-- Aboutページ表示 -->
      <div v-if="currentView === 'about'" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6 animate-in fade-in zoom-in duration-300">
        <!-- ロゴ表示部分 -->
        <div class="flex justify-center mb-2">
          <img src="https://wakame-navi.vercel.app/assets/logo.svg" alt="わかめナビ ロゴ" class="h-28 w-auto" @error="handleImageError" />
        </div>

        <div class="space-y-4 text-gray-600 leading-relaxed text-sm">
          <p>本日はわかめナビ🌱をご利用いただきまして、誠にありがとうございます。</p>
          <p>埼玉大学前を通っている国道463号線(通称「埼大通り」)は、埼玉県越谷市、さいたま市、所沢市を経て、入間市へと至る国道であり、その総距離は58kmにもなります。主要幹線道路のため、その交通量は非常に多く、交通渋滞が発生することも少なくありません。その結果として10～30分の遅延が発生することもあり、従来の時刻表があてにならないという事態も生じています。</p>
          <p>これらの遅延状況を知らせるものとして、国際興業バス及び西武バスには、それぞれにバス走行位置を確認することのできるサービスがあります。しかしながら、それらを一括で閲覧することはできません。</p>
          <p>そこでわかめナビ🌱では、埼玉大学周辺を走るバスの運行情報を一括で閲覧することができるようにし、次に乗るバスを簡単に確認することができるようにしました。素敵な大学生活を支えるインフラの一つになれば幸いにございます。</p>
          <p class="text-xs text-gray-500 bg-gray-50 p-4 rounded-lg mt-6 leading-relaxed">なお当サイトは、埼玉大学に在学している学生が開発しているものであり、埼玉大学とは一切関係ございません。お問い合わせは<a href="https://twitter.com/SU_Mentsuyu" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-bold">こちら</a>までお願いいたします。</p>
        </div>

        <div class="pt-4 border-t border-gray-100 text-xs text-gray-400 text-center">
          <p>© わかめナビ🌱</p>
        </div>
      </div>

      <!-- 時刻表ページ表示 -->
      <template v-else>
        <!-- 区間選択パネル -->
        <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
          <!-- 乗車バス停 -->
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">
              <MapPin class="w-3 h-3 text-blue-500" />
              乗車バス停 (出発)
            </label>
            <div class="relative">
              <select :value="selectedBoardingStop" @change="handleBoardingChange" class="w-full p-3 pl-3 pr-10 bg-white border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700">
                <option v-for="stopName in allStops" :key="stopName" :value="stopName">{{ stopName }}</option>
              </select>
              <ChevronDown class="w-5 h-5 text-gray-400 absolute right-3 top-4 pointer-events-none" />
            </div>
          </div>

          <div class="flex justify-center -my-2 relative z-0">
            <button @click="swapStops" :disabled="!selectedDropOffStop" class="bg-gray-100 p-1.5 rounded-full transition-colors border border-gray-200 shadow-sm z-10" :class="selectedDropOffStop ? 'text-green-600 hover:bg-green-50 hover:border-green-300 cursor-pointer' : 'text-gray-300 cursor-not-allowed'" title="出発地と到着地を入れ替え" aria-label="出発地と到着地を入れ替える">
              <ArrowLeftRight class="w-4 h-4 rotate-90" />
            </button>
          </div>

          <!-- 降車バス停 (任意) -->
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">
              <MapPin class="w-3 h-3 text-red-500" />
              降車バス停 (到着・任意)
            </label>
            <div class="relative">
              <select :value="selectedDropOffStop" @change="handleDropOffChange" :disabled="availableDropOffStops.length === 0" class="w-full p-3 pl-3 pr-10 bg-white border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-60">
                <option value="">指定なし (すべての行き先を表示)</option>
                <option v-for="stopName in availableDropOffStops" :key="stopName" :value="stopName">{{ stopName }}</option>
              </select>
              <ChevronDown class="w-5 h-5 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>
            <!-- 補足メッセージ -->
            <p v-if="selectedBoardingStop && availableDropOffStops.length > 0" class="text-[10px] text-gray-400 mt-1 text-right">※ 逆方向のバスに乗る場合は、乗車バス停を変更してください</p>
          </div>
        </section>

        <!-- 運行状況要約 -->
        <section class="flex justify-between items-center px-1">
          <div class="text-xs text-gray-500 flex items-center gap-1">
            <Clock class="w-3 h-3" />
            {{ formatTime(lastUpdated) }} 現在
          </div>
          <span v-if="hasDelayInUpcoming" class="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded flex items-center gap-1 animate-pulse"> <AlertTriangle class="w-3 h-3" /> 遅延発生中 </span>
        </section>

        <!-- 次のバス（ハイライト） -->
        <section v-if="nextBus" :class="`${nextBus.routeColor} text-white rounded-xl shadow-lg p-5 relative overflow-hidden transition-all duration-300`">
          <!-- 会社ロゴっぽい表示 -->
          <div class="absolute top-4 right-4 text-xs font-bold px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded border border-white/30">
            {{ nextBus.company === "Kokusai" ? "国際興業バス" : "西武バス" }}
          </div>

          <div class="absolute -bottom-4 -right-4 p-3 opacity-10">
            <Bus class="w-32 h-32" />
          </div>

          <div class="relative z-10">
            <div class="flex items-center gap-2 mb-1 opacity-90">
              <span class="text-xs font-bold border border-white/40 px-2 py-0.5 rounded bg-black/10">先発</span>
              <span class="text-sm font-medium">{{ nextBus.boardingStopName }} 発</span>
            </div>

            <div class="flex items-baseline gap-3 my-2">
              <span class="text-6xl font-bold tracking-tighter tabular-nums">
                {{ nextBus.estimatedTime.slice(0, 5) }}
                <span class="text-2xl ml-1">{{ nextBus.estimatedTime.slice(6) }}</span>
              </span>
            </div>

            <div class="flex items-center gap-3 text-sm font-medium text-white/90 mb-4">
              <span class="opacity-80">定刻: {{ nextBus.scheduledTime }}</span>
              <span v-if="nextBus.delay > 0" class="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold shadow-sm"> +{{ nextBus.delay }}分 遅れ </span>
            </div>

            <div class="pt-3 border-t border-white/20">
              <div class="flex items-center gap-2 mb-1">
                <span class="bg-white text-gray-800 font-bold px-1.5 py-0.5 rounded text-[10px] shadow-sm">
                  {{ nextBus.routeCode }}
                </span>
                <span class="font-bold text-lg">{{ nextBus.destination }} <span class="text-sm font-normal opacity-80">行</span></span>
              </div>
            </div>
          </div>
        </section>

        <section v-else class="bg-gray-200 rounded-xl p-8 text-center text-gray-500">
          <p class="font-bold">該当するバスがありません</p>
          <p class="text-xs mt-2">条件を変更するか、運行終了している可能性があります。</p>
        </section>

        <!-- 統合時刻表リスト -->
        <section class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-3">
            <div class="flex justify-between items-center">
              <h3 class="font-bold text-gray-700 flex items-center gap-2">
                <Filter class="w-4 h-4 text-gray-500" />
                通過予定リスト
              </h3>
              <span v-if="selectedDropOffStop" class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold"> {{ selectedDropOffStop }} まで </span>
            </div>

            <!-- 表示順序切り替えスイッチ -->
            <div class="flex bg-gray-200 p-1 rounded-lg">
              <button @click="sortType = 'estimated'" class="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-all" :class="sortType === 'estimated' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'">
                <Clock class="w-3.5 h-3.5" />
                予測順 (遅延反映)
              </button>
              <button @click="sortType = 'scheduled'" class="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-all" :class="sortType === 'scheduled' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'">
                <CalendarClock class="w-3.5 h-3.5" />
                定刻順 (ダイヤ通り)
              </button>
            </div>
          </div>

          <div class="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            <template v-for="(bus, index) in integratedTimetable" :key="`${bus.routeId}-${index}`">
              <!-- 過ぎたバスはリストに表示しない（次発が先頭に来るように） -->
              <div v-if="!(bus.isPast && index !== nextBusIndex)" class="p-3 sm:p-4 flex justify-between items-center transition-colors border-l-4" :class="index === nextBusIndex ? 'bg-yellow-50/80 border-yellow-400 pl-2 sm:pl-3' : 'hover:bg-gray-50 border-transparent'">
                <div class="flex items-start gap-3 w-full">
                  <!-- 時刻表示部 -->
                  <div class="flex flex-col items-center min-w-[4rem]">
                    <template v-if="sortType === 'estimated'">
                      <span class="text-xl sm:text-2xl font-bold tabular-nums leading-none" :class="index === nextBusIndex ? 'text-gray-900' : 'text-gray-600'">
                        {{ bus.estimatedTime.slice(0, 5) }}
                      </span>
                      <span class="text-[10px] text-gray-400 mt-1"> 定刻 {{ bus.scheduledTime }} </span>
                    </template>
                    <template v-else>
                      <span class="text-xl sm:text-2xl font-bold tabular-nums leading-none" :class="index === nextBusIndex ? 'text-gray-900' : 'text-gray-800'">
                        {{ bus.scheduledTime }}
                      </span>
                      <div class="flex flex-col items-center mt-1">
                        <span class="text-[10px] text-gray-500"> 予測 {{ bus.estimatedTime.slice(0, 5) }} </span>
                        <span v-if="bus.delay > 0" class="text-[9px] text-red-500 font-bold bg-red-50 px-1 rounded-sm mt-0.5"> +{{ bus.delay }}分 </span>
                      </div>
                    </template>
                  </div>

                  <!-- 系統・行先情報 -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                      <!-- 会社バッジ -->
                      <span class="text-[9px] font-bold px-1.5 py-0.5 rounded text-white" :class="bus.company === 'Kokusai' ? 'bg-green-600' : 'bg-cyan-600'">
                        {{ bus.company === "Kokusai" ? "国際" : "西武" }}
                      </span>

                      <!-- 系統コードバッジ -->
                      <span class="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-white" :class="[bus.textColor, bus.borderColor]">
                        {{ bus.routeCode }}
                      </span>

                      <!-- 遅延情報バッジ (予測順の時はここに表示) -->
                      <span v-if="sortType === 'estimated' && bus.delay > 0" class="text-[10px] text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded"> +{{ bus.delay }}分 </span>

                      <!-- まもなく表示 -->
                      <span v-if="index === nextBusIndex" class="ml-auto text-[10px] font-bold text-white bg-yellow-500 px-2 py-0.5 rounded shadow-sm animate-pulse whitespace-nowrap"> まもなく </span>
                    </div>

                    <div class="flex items-center text-gray-800 font-medium truncate">
                      <span class="truncate text-sm sm:text-base"> {{ bus.destination }} <span class="text-xs text-gray-400 font-normal">行</span> </span>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <div v-if="integratedTimetable.length > 0 && integratedTimetable.every(b => b.isPast)" class="p-8 text-center text-gray-400 text-sm">表示できるバスがありません</div>
            <div v-if="integratedTimetable.length === 0" class="p-8 text-center text-gray-400 text-sm">この区間の運行はありません</div>
          </div>
        </section>
      </template>
    </main>

    <!-- ボトムナビゲーション -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      <div class="max-w-md mx-auto grid grid-cols-2 h-16">
        <button @click="currentView = 'timetable'" class="flex flex-col items-center justify-center gap-1 transition-colors" :class="currentView === 'timetable' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'">
          <ListOrdered class="w-6 h-6" />
          <span class="text-[10px] font-bold">時刻表</span>
        </button>

        <button @click="currentView = 'about'" class="flex flex-col items-center justify-center gap-1 transition-colors" :class="currentView === 'about' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'">
          <Info class="w-6 h-6" />
          <span class="text-[10px] font-bold">About</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, onMounted, onUnmounted } from "vue";

  import { Bus, Clock, RefreshCw, AlertTriangle, MapPin, ChevronDown, Filter, ArrowLeftRight, CalendarClock, ListOrdered, Info } from "lucide-vue-next";

  // --- データ定義 ---

  // 頂いたデータを元に構築
  const KOKUSAI_ROUTES_DATA = {
    北浦03: [
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
    南与01: [
      { id: "00021362", name: "南与野駅西口" },
      { id: "00021225", name: "鈴谷札の辻" },
      { id: "00021226", name: "山久保" },
      { id: "00021227", name: "栄和北町" },
      { id: "00021228", name: "大泉院通り" },
      { id: "00021229", name: "埼玉大学" }
    ],
    南与02: [
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
    北朝02: [
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
    浦11: [
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
    浦12: [
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
    浦13: [
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
    浦15: [
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

  // 画面遷移の状態: 'timetable' | 'about'
  const currentView = ref("timetable");

  const selectedBoardingStop = ref("南与野駅西口");
  const selectedDropOffStop = ref(""); // 空の場合は「指定なし」
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
      const priority = ["南与野駅西口", "埼玉大学", "北浦和駅西口", "北朝霞駅", "志木駅東口", "浦和駅西口"];
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

  // 選択可能な降車バス停リスト
  const availableDropOffStops = computed(() => {
    const possibleStops = new Set<string>();
    GENERATED_ROUTES.forEach(route => {
      const boardingIndex = route.stops.findIndex((s: any) => s.name === selectedBoardingStop.value);
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

  // 統合時刻表データ
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

  // イベントハンドラ
  const handleBoardingChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    selectedBoardingStop.value = target.value;
    selectedDropOffStop.value = "";
  };

  const handleDropOffChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    selectedDropOffStop.value = target.value;
  };

  const swapStops = () => {
    if (selectedDropOffStop.value) {
      const temp = selectedBoardingStop.value;
      selectedBoardingStop.value = selectedDropOffStop.value;
      selectedDropOffStop.value = temp;
    }
  };

  const handleImageError = (e: Event) => {
    const img = e.target as HTMLImageElement;
    img.onerror = null;
    img.style.display = "none";
  };
</script>
