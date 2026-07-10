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

    <div class="flex items-center justify-start gap-5 px-1 py-1 overflow-x-auto no-scrollbar min-h-[96px]">
      <transition-group
        name="pinned-list"
        tag="div"
        class="flex items-center gap-5"
      >
        <div
          v-for="(route, index) in localPinnedRoutes"
          :key="route.id"
          draggable="true"
          @dragstart="onDragStart(index, $event)"
          @dragover.prevent="onPinnedDragOver(index, $event)"
          @dragend="onDragEnd"
          class="flex flex-col items-center group cursor-grab active:cursor-grabbing flex-shrink-0 relative select-none"
          @click="applyRoute(route.boarding, route.dropOff)"
          :class="{
            'opacity-30 scale-90': draggedIndex === index
          }"
        >
          <div class="relative">
            <div class="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-[0_4px_12px_rgba(16,185,129,0.2)] group-hover:shadow-[0_6px_18px_rgba(16,185,129,0.35)] group-hover:scale-105 active:scale-95 transition-all duration-300 border border-emerald-400">
              <Bus class="w-6 h-6 transition-transform group-hover:rotate-6" />
            </div>
            <button
              @click.stop="togglePinRoute(route.id)"
              draggable="false"
              class="absolute -top-1 -right-1 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full p-1 shadow-sm border border-slate-100 hover:border-red-100 transition-all duration-200 cursor-pointer"
              title="ピン留め解除"
            >
              <X class="w-2.5 h-2.5" />
            </button>
          </div>
          <span class="text-[10px] font-bold text-slate-600 mt-2 truncate max-w-[84px] text-center tracking-wide group-hover:text-emerald-700 transition-colors">
            {{ formatRouteLabel(route.boarding, route.dropOff) }}
          </span>
        </div>
      </transition-group>

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
  import { computed } from "vue";
  import {
    Pin,
    Bus,
    X
  } from "lucide-vue-next";
  import { useBusTimetable } from "@/composables/bus/useBusTimetable";
  import { useDragReorder } from "@/composables/bus/useDragReorder";
  import type { MyRoute } from "@/composables/bus/busTypes";

  const {
    myRoutes,
    togglePinRoute,
    updateMyRoutes,
    applyRoute
  } = useBusTimetable();

  const {
    localItems,
    draggedIndex,
    onDragStart,
    onSubsetDragOver,
    onDragEnd,
  } = useDragReorder<MyRoute>({
    source: myRoutes,
    onCommit: updateMyRoutes,
    axis: "horizontal",
  });

  const localPinnedRoutes = computed(() => {
    return localItems.value.filter(r => r.isPinned).slice(0, 3);
  });

  const onPinnedDragOver = (index: number, event: DragEvent) => {
    onSubsetDragOver(index, event, localPinnedRoutes.value, r => r.id);
  };

  const formatRouteLabel = (boarding: string, dropOff: string) => {
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
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .pinned-list-move {
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

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
