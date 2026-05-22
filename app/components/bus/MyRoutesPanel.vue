<template>
  <div class="space-y-4">
    <!-- 📌 ピン留めお気に入りショートカット -->
    <div class="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-emerald-50/50 p-5 space-y-4">
      <div class="flex items-center justify-between ml-1">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Pin class="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />
          ピン留めショートカット (最大3件)
        </h3>
        <span class="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
          {{ pinnedRoutes.length }}/3
        </span>
      </div>

      <div class="flex items-center justify-start gap-5 px-1 py-1 overflow-x-auto no-scrollbar">
        <!-- ピン留めされたルートボタン -->
        <div
          v-for="route in pinnedRoutes"
          :key="route.id"
          class="flex flex-col items-center group cursor-pointer flex-shrink-0"
          @click="$emit('applyRoute', route.boarding, route.dropOff)"
        >
          <div class="relative">
            <!-- 円形グラデーションボタン -->
            <div class="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-[0_4px_12px_rgba(16,185,129,0.2)] group-hover:shadow-[0_6px_18px_rgba(16,185,129,0.35)] group-hover:scale-105 active:scale-95 transition-all duration-300 border border-emerald-400">
              <Bus class="w-6 h-6 transition-transform group-hover:rotate-6" />
            </div>
            <!-- ピン留め解除用クイックボタン -->
            <button
              @click.stop="$emit('togglePinRoute', route.id)"
              class="absolute -top-1 -right-1 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full p-1 shadow-sm border border-slate-100 hover:border-red-100 transition-all duration-200"
              title="ピン留め解除"
            >
              <X class="w-2.5 h-2.5" />
            </button>
          </div>
          <!-- 略称ラベル -->
          <span class="text-[10px] font-bold text-slate-600 mt-2 truncate max-w-[84px] text-center tracking-wide group-hover:text-emerald-700 transition-colors">
            {{ formatRouteLabel(route.boarding, route.dropOff) }}
          </span>
        </div>

        <!-- 空スロット (ピン留めが3件未満の場合のプレースホルダー) -->
        <div
          v-for="i in (3 - pinnedRoutes.length)"
          :key="'empty-' + i"
          class="flex flex-col items-center flex-shrink-0"
        >
          <div class="w-14 h-14 rounded-full border-2 border-dashed border-slate-200 text-slate-300 flex items-center justify-center bg-slate-50/30">
            <Star class="w-5 h-5" />
          </div>
          <span class="text-[9px] font-bold text-slate-400 mt-2 tracking-wide select-none">
            未設定
          </span>
        </div>
      </div>
    </div>

    <!-- ⭐️ 登録したルート一覧 (アコーディオン) -->
    <div
      v-if="myRoutes.length > 0"
      class="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-emerald-50/50 overflow-hidden transition-all duration-300"
    >
      <!-- アコーディオンヘッダー -->
      <button
        @click="isAccordionOpen = !isAccordionOpen"
        class="w-full flex items-center justify-between p-5 font-bold text-slate-700 hover:bg-slate-50/50 transition-colors duration-300 cursor-pointer"
      >
        <div class="flex items-center gap-2">
          <Star class="w-4 h-4 text-amber-400 fill-amber-400" />
          <span class="text-sm tracking-wide">登録したルート</span>
          <span class="text-xs text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full font-bold ml-1">
            {{ myRoutes.length }}/20件
          </span>
        </div>
        <ChevronDown
          class="w-4 h-4 text-slate-400 transition-transform duration-300"
          :class="{ 'rotate-180': isAccordionOpen }"
        />
      </button>

      <!-- アコーディオンコンテンツ -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform scale-y-95 opacity-0 origin-top"
        enter-to-class="transform scale-y-100 opacity-100 origin-top"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform scale-y-100 opacity-100 origin-top"
        leave-to-class="transform scale-y-95 opacity-0 origin-top"
      >
        <div v-show="isAccordionOpen" class="px-5 pb-5 border-t border-slate-50/50 pt-4">
          <div class="max-h-72 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
            <div
              v-for="route in sortedMyRoutes"
              :key="route.id"
              @click="$emit('applyRoute', route.boarding, route.dropOff)"
              class="flex items-center justify-between p-3.5 bg-slate-50/50 hover:bg-emerald-50/30 rounded-2xl border border-slate-100/80 hover:border-emerald-100/50 transition-all duration-300 active:scale-[0.99] cursor-pointer group"
            >
              <!-- 左: スター（ピン留め）ボタン -->
              <button
                @click.stop="$emit('togglePinRoute', route.id)"
                class="p-1 rounded-lg transition-colors flex-shrink-0"
                :title="route.isPinned ? 'ピン留め解除' : 'ピン留めに設定'"
              >
                <Star
                  class="w-4 h-4 transition-all duration-300"
                  :class="route.isPinned ? 'text-amber-400 fill-amber-400 scale-110' : 'text-slate-300 group-hover:text-slate-400'"
                />
              </button>

              <!-- 中: ルートテキスト -->
              <div class="flex-grow px-3 flex items-center gap-2 min-w-0">
                <span class="text-xs font-bold text-slate-700 truncate block">
                  {{ route.boarding }}
                </span>
                <ArrowRight class="w-3 h-3 text-slate-300 flex-shrink-0 group-hover:text-emerald-400 transition-colors" />
                <span class="text-xs font-medium text-slate-500 truncate block">
                  {{ route.dropOff || '指定なし (全表示)' }}
                </span>
              </div>

              <!-- 右: 削除ボタン -->
              <button
                @click.stop="$emit('removeMyRoute', route.id)"
                class="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 flex-shrink-0 cursor-pointer"
                title="削除"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- 💡 初回ガイド（マイルート未登録時のみ表示） -->
    <div
      v-else
      class="bg-emerald-50/20 rounded-[2rem] border border-dashed border-emerald-200/50 p-6 text-center space-y-2 animate-in fade-in duration-500"
    >
      <div class="inline-flex p-3 rounded-full bg-emerald-50 text-emerald-600">
        <Sparkles class="w-5 h-5 animate-pulse" />
      </div>
      <h4 class="text-xs font-bold text-emerald-800">マイルートを登録してみましょう！</h4>
      <p class="text-[10px] text-slate-400 leading-relaxed max-w-xs mx-auto">
        よく使うバスの区間を検索し、下部の「⭐ マイルートに登録」ボタンから保存すると、ワンタップで即座にバスを検索できるようになります。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from "vue";
  import {
    Pin,
    Star,
    Bus,
    X,
    ChevronDown,
    ArrowRight,
    Trash2,
    Sparkles
  } from "lucide-vue-next";

  // マイルートインターフェース
  interface MyRoute {
    id: string;
    boarding: string;
    dropOff: string;
    isPinned: boolean;
    createdAt: number;
  }

  // Propsの定義
  const props = defineProps<{
    myRoutes: MyRoute[];
    pinnedRoutes: MyRoute[];
  }>();

  // Emitsの定義
  defineEmits<{
    applyRoute: [boarding: string, dropOff: string];
    removeMyRoute: [id: string];
    togglePinRoute: [id: string];
  }>();

  // --- アコーディオンの状態 ---
  const isAccordionOpen = ref(true);

  // 登録日時の新しい順にソートして表示
  const sortedMyRoutes = computed(() => {
    return [...props.myRoutes].sort((a, b) => b.createdAt - a.createdAt);
  });

  // ショートカット用のルート名コンパクトフォーマット
  const formatRouteLabel = (boarding: string, dropOff: string) => {
    // 埼玉大学 ➔ 埼大, 北浦和駅西口 ➔ 北浦和 などの簡略化
    const simplify = (name: string) => {
      if (!name) return "";
      return name
        .replace("埼玉大学", "埼大")
        .replace("駅西口", "")
        .replace("駅東口", "")
        .replace("駅北入口", "北口")
        .replace("大久保浄水場", "浄水場")
        .replace("常磐十丁目", "常磐")
        .replace("大戸小学校", "大戸小")
        .replace("南与野駅", "南与野");
    };

    const simplifiedBoarding = simplify(boarding);
    const simplifiedDropOff = simplify(dropOff);

    if (simplifiedDropOff) {
      return `${simplifiedBoarding} ➔ ${simplifiedDropOff}`;
    }
    return `${simplifiedBoarding} 発`;
  };
</script>

<style scoped>
  /* スクロールバーの非表示 */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  /* リストスクロールバーのカスタマイズ */
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 9999px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #a1a1aa;
  }
</style>
