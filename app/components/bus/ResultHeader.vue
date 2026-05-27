<template>
  <!-- 上部ナビゲーション / 選択区間サマリー -->
  <div class="flex items-center justify-between bg-white rounded-3xl border border-emerald-50/50 shadow-[0_8px_30px_rgb(0,0,0,0.03)] px-5 py-4 gap-3">
    <!-- 左: 戻る -->
    <button @click="$emit('clickBack')" class="flex items-center gap-1 text-slate-500 hover:text-emerald-700 transition-colors text-xs font-black cursor-pointer bg-slate-50 hover:bg-emerald-50/50 px-3 py-2 rounded-xl border border-slate-100/80 hover:border-emerald-100/50 flex-shrink-0">
      <ChevronLeft class="w-4 h-4" />
      <span>戻る</span>
    </button>

    <!-- 中央: 区間名サマリー -->
    <div class="flex items-center justify-center gap-2 text-xs font-bold text-slate-700 min-w-0 flex-grow px-1">
      <span class="truncate block text-emerald-800 font-extrabold">{{ boardingStop }}</span>
      <ArrowRight class="w-3 h-3 text-slate-300 flex-shrink-0" />
      <span class="truncate block text-slate-500 font-medium">{{ dropOffStop || '指定なし (全表示)' }}</span>
    </div>

    <!-- 右: お気に入り登録/解除 -->
    <button
      @click="$emit('clickFavorite')"
      class="flex items-center justify-center p-2.5 rounded-xl border border-slate-100/80 hover:border-amber-100/50 hover:bg-amber-50/50 transition-all duration-300 cursor-pointer active:scale-95 flex-shrink-0"
      :title="isFavorite ? 'マイルートから削除' : 'マイルートに登録'"
    >
      <Star
        class="w-4 h-4 transition-all duration-300"
        :class="isFavorite ? 'text-amber-400 fill-amber-400 scale-110' : 'text-slate-400 hover:text-amber-500'"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
  import { ChevronLeft, ArrowRight, Star } from "lucide-vue-next";

  defineProps<{
    boardingStop: string;
    dropOffStop: string;
    isFavorite: boolean;
  }>();

  defineEmits<{
    clickBack: [];
    clickFavorite: [];
  }>();
</script>
