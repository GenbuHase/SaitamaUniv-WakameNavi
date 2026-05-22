<template>
  <div class="space-y-4">
    <!-- ⭐️ 登録したルート一覧 (アコーディオン) -->
    <div
      v-if="localMyRoutes.length > 0"
      class="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-emerald-50/50 overflow-hidden transition-all duration-300"
    >
      <!-- アコーディオンヘッダー -->
      <button
        @click="isAccordionOpen = !isAccordionOpen"
        class="w-full flex items-center justify-between p-5 font-bold text-slate-700 hover:bg-slate-50/50 transition-colors duration-300 cursor-pointer"
      >
        <div class="flex items-center gap-2">
          <Star class="w-4 h-4 text-amber-400 fill-amber-400" />
          <div class="flex flex-col items-start text-left">
            <span class="text-sm tracking-wide">登録したルート</span>
            <span class="text-[9px] font-normal text-slate-400 mt-0.5">左端のつまみでドラッグして並べ替えできます</span>
          </div>
          <span class="text-xs text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full font-bold ml-1">
            {{ localMyRoutes.length }}/20件
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
          <transition-group
            name="route-list"
            tag="div"
            class="max-h-72 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar min-h-[50px]"
          >
            <div
              v-for="(route, index) in localMyRoutes"
              :key="route.id"
              :draggable="isRouteDraggable(route.id)"
              @dragstart="onRouteDragStart(index, $event)"
              @dragover.prevent="onRouteDragOver(index, $event)"
              @dragend="onRouteDragEnd"
              @click="$emit('applyRoute', route.boarding, route.dropOff)"
              class="flex items-center justify-between p-3.5 bg-slate-50/50 hover:bg-emerald-50/30 rounded-2xl border border-slate-100/80 hover:border-emerald-100/50 transition-all duration-300 active:scale-[0.99] cursor-pointer group relative select-none"
              :class="{
                'opacity-30 border-dashed border-emerald-300 bg-emerald-50/20 shadow-inner scale-[0.98]': draggedIndex === index
              }"
            >
              <!-- 左端: ドラッグハンドル -->
              <div
                class="p-1 text-slate-300 hover:text-slate-500 rounded cursor-grab active:cursor-grabbing mr-1 flex-shrink-0 touch-none"
                title="ドラッグして並べ替え"
                @mouseenter="enableDrag(route.id)"
                @mouseleave="disableDrag"
              >
                <GripVertical class="w-4 h-4" />
              </div>

              <!-- 左: スター（ピン留め）ボタン -->
              <button
                @click.stop="$emit('togglePinRoute', route.id)"
                draggable="false"
                class="p-1 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
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
                draggable="false"
                class="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 flex-shrink-0 cursor-pointer"
                title="削除"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </transition-group>
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
  import { ref, watch } from "vue";
  import {
    Star,
    ChevronDown,
    ArrowRight,
    Trash2,
    Sparkles,
    GripVertical
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
  }>();

  // Emitsの定義
  const emit = defineEmits<{
    applyRoute: [boarding: string, dropOff: string];
    removeMyRoute: [id: string];
    togglePinRoute: [id: string];
    updateMyRoutes: [newRoutes: MyRoute[]];
  }>();

  // --- アコーディオンの状態 ---
  const isAccordionOpen = ref(true);

  // --- ドラッグ中状態管理 ---
  const draggedIndex = ref<number | null>(null);
  const draggableRouteId = ref<string | null>(null);

  // ドラッグハンドルの hover で draggable 属性を制御
  const isRouteDraggable = (id: string) => {
    return draggableRouteId.value === id;
  };
  const enableDrag = (id: string) => {
    draggableRouteId.value = id;
  };
  const disableDrag = () => {
    if (draggedIndex.value === null) {
      draggableRouteId.value = null;
    }
  };

  // ドラッグ＆ドロップ動作を完璧に安定させるためのローカルステート
  const localMyRoutes = ref<MyRoute[]>([]);

  // 親のProps変更を監視して同期する（ドラッグ中は再レンダリング防止のため同期をロック）
  watch(
    () => props.myRoutes,
    (newVal) => {
      if (draggedIndex.value === null) {
        localMyRoutes.value = [...newVal];
      }
    },
    { immediate: true, deep: true }
  );

  // 1. マイルートのドラッグハンドラ
  const onRouteDragStart = (index: number, event: DragEvent) => {
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", index.toString());
      
      const target = event.currentTarget as HTMLElement;
      if (target) {
        target.style.opacity = "0.99";
      }
    }
    // ドラッグイメージ（ゴースト）が正しく生成されるよう、インデックスの格納を非同期化する
    setTimeout(() => {
      draggedIndex.value = index;
    }, 0);
  };

  const onRouteDragOver = (index: number, event: DragEvent) => {
    event.preventDefault();
    if (draggedIndex.value === null || draggedIndex.value === index) return;

    // 高さの半分を境界線として超えたときのみ入れ替えを実行（チャタリングを完全防止）
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const relativeY = event.clientY - rect.top;
    const threshold = rect.height / 2;

    if (draggedIndex.value < index && relativeY < threshold) {
      return;
    }
    if (draggedIndex.value > index && relativeY > threshold) {
      return;
    }

    // ローカル配列内だけで要素の入れ替えを行う（親にはエミットしないことでDOMロストを防止）
    const target = localMyRoutes.value[draggedIndex.value];
    localMyRoutes.value.splice(draggedIndex.value, 1);
    localMyRoutes.value.splice(index, 0, target);

    draggedIndex.value = index;
  };

  const onRouteDragEnd = () => {
    if (draggedIndex.value !== null) {
      // ドラッグが安全に完了したタイミングで、最終的な並び順を一気にエミットして保存
      emit("updateMyRoutes", [...localMyRoutes.value]);
    }
    draggedIndex.value = null;
    draggableRouteId.value = null; // ドラッグ終了時に確実にリセット
  };
</script>

<style scoped>
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

  /* 並び替え時のスライドアニメーション (FLIP) */
  .route-list-move {
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
</style>
