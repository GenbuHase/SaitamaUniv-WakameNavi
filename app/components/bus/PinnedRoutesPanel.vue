<template>
  <!-- 📌 ピン留めルート -->
  <div class="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-emerald-50/50 p-5 space-y-4">
    <div class="flex items-center justify-between ml-1">
      <div class="flex items-center gap-2">
        <Pin class="w-4 h-4 text-red-500 fill-red-500" />
        <div class="flex flex-col items-start text-left">
          <h3 class="text-sm font-bold text-slate-700 tracking-wide">ピン留めルート</h3>
          <span class="text-[9px] text-slate-400 mt-0.5">ドラッグ＆ドロップで並び替えできます</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full font-bold">
          {{ localPinnedRoutes.length }}/3
        </span>
      </div>
    </div>

    <!-- ピン留めエリアのフレックスラッパー（空スロットも一緒に並べる） -->
    <div class="flex items-center justify-start gap-5 px-1 py-1 overflow-x-auto no-scrollbar min-h-[96px]">
      <!-- ピン留めされたルートボタンのみを transition-group にする -->
      <transition-group
        name="pinned-list"
        tag="div"
        class="flex items-center gap-5"
      >
        <!-- ピン留めされたルートボタン -->
        <div
          v-for="(route, index) in localPinnedRoutes"
          :key="route.id"
          draggable="true"
          @dragstart="onPinnedDragStart(index, $event)"
          @dragover.prevent="onPinnedDragOver(index, $event)"
          @dragend="onPinnedDragEnd"
          class="flex flex-col items-center group cursor-grab active:cursor-grabbing flex-shrink-0 relative select-none"
          @click="applyRoute(route.boarding, route.dropOff)"
          :class="{
            'opacity-30 scale-90': draggedPinnedIndex === index
          }"
        >
          <div class="relative">
            <!-- 円形グラデーションボタン -->
            <div class="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-[0_4px_12px_rgba(16,185,129,0.2)] group-hover:shadow-[0_6px_18px_rgba(16,185,129,0.35)] group-hover:scale-105 active:scale-95 transition-all duration-300 border border-emerald-400">
              <Bus class="w-6 h-6 transition-transform group-hover:rotate-6" />
            </div>
            <!-- ピン留め解除用クイックボタン -->
            <button
              @click.stop="togglePinRoute(route.id)"
              draggable="false"
              class="absolute -top-1 -right-1 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full p-1 shadow-sm border border-slate-100 hover:border-red-100 transition-all duration-200 cursor-pointer"
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
      </transition-group>

      <!-- 空スロット (ピン留めが3件未満の場合のプレースホルダー) は transition-group の外側に配置 -->
      <div
        v-for="i in (3 - localPinnedRoutes.length)"
        :key="'empty-' + i"
        class="flex flex-col items-center flex-shrink-0 select-none"
      >
        <div class="w-14 h-14 rounded-full border-2 border-dashed border-slate-200 text-slate-300 flex items-center justify-center bg-slate-50/30">
          <Pin class="w-5 h-5" />
        </div>
        <span class="text-[9px] font-bold text-slate-400 mt-2 tracking-wide">
          未設定
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from "vue";
  import {
    Pin,
    Bus,
    X
  } from "lucide-vue-next";
  import { useBusTimetable } from "@/composables/bus/useBusTimetable";
  import type { MyRoute } from "@/composables/bus/useBusTimetable";

  // Composableから状態とアクションを呼び出す
  const {
    myRoutes,
    togglePinRoute,
    updateMyRoutes,
    applyRoute
  } = useBusTimetable();

  // --- ドラッグ中状態管理 ---
  const draggedPinnedIndex = ref<number | null>(null);

  // ドラッグ＆ドロップ動作を完璧に安定させるためのローカルステート
  const localMyRoutes = ref<MyRoute[]>([]);

  // 親のProps変更を監視して同期する（ドラッグ中は再レンダリング防止のため同期をロック）
  watch(
    myRoutes,
    (newVal) => {
      if (draggedPinnedIndex.value === null) {
        localMyRoutes.value = [...newVal];
      }
    },
    { immediate: true, deep: true }
  );

  // ローカルステートからピン留めリストを算出
  const localPinnedRoutes = computed(() => {
    return localMyRoutes.value.filter(r => r.isPinned).slice(0, 3);
  });

  // 📌 ピン留めショートカットのドラッグハンドラ
  const onPinnedDragStart = (index: number, event: DragEvent) => {
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", index.toString());
    }
    // ドラッグイメージが正しく生成されるよう非同期化
    setTimeout(() => {
      draggedPinnedIndex.value = index;
    }, 0);
  };

  const onPinnedDragOver = (index: number, event: DragEvent) => {
    event.preventDefault();
    if (draggedPinnedIndex.value === null || draggedPinnedIndex.value === index) return;

    // 幅の半分を境界線として超えたときのみ入れ替えを実行（チャタリングを完全防止）
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const relativeX = event.clientX - rect.left;
    const threshold = rect.width / 2;

    if (draggedPinnedIndex.value < index && relativeX < threshold) {
      return;
    }
    if (draggedPinnedIndex.value > index && relativeX > threshold) {
      return;
    }

    const pinnedList = [...localPinnedRoutes.value];
    const draggedRoute = pinnedList[draggedPinnedIndex.value];
    const targetRoute = pinnedList[index];

    // 全体の localMyRoutes 配列内でのインデックスを探してスワップする
    const draggedIdxInAll = localMyRoutes.value.findIndex(r => r.id === draggedRoute.id);
    const targetIdxInAll = localMyRoutes.value.findIndex(r => r.id === targetRoute.id);

    if (draggedIdxInAll !== -1 && targetIdxInAll !== -1) {
      localMyRoutes.value[draggedIdxInAll] = targetRoute;
      localMyRoutes.value[targetIdxInAll] = draggedRoute;

      draggedPinnedIndex.value = index;
    }
  };

  const onPinnedDragEnd = () => {
    if (draggedPinnedIndex.value !== null) {
      updateMyRoutes([...localMyRoutes.value]);
    }
    draggedPinnedIndex.value = null;
  };

  // ショートカット用のルート名コンパクトフォーマット
  const formatRouteLabel = (boarding: string, dropOff: string) => {
    // 埼玉大学 ➔ 埼大, 北浦和駅西口 ➔ 北浦和 などの簡略化
    const simplify = (name: string) => {
      if (!name) return "";
      return name
        .replace("埼玉大学", "埼大")
        .replace("駅", "")
        .replace("西口", "")
        .replace("東口", "")
        .replace("北入口", "北");
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

  /* 並び替え時のスライドアニメーション (FLIP) */
  .pinned-list-move {
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* 追加・削除時のトランジション */
  .pinned-list-enter-active,
  .pinned-list-leave-active {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .pinned-list-enter-from,
  .pinned-list-leave-to {
    opacity: 0;
    transform: scale(0.8);
  }
</style>
