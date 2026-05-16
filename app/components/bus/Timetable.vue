<template>
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

        <button @click="$emit('update:sortType', 'estimated')" class="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-colors relative z-10" :class="sortType === 'estimated' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'">
          <Clock class="w-3.5 h-3.5" />
          予測順 <span class="hidden sm:inline">(遅延反映)</span>
        </button>
        <button @click="$emit('update:sortType', 'scheduled')" class="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-colors relative z-10" :class="sortType === 'scheduled' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'">
          <CalendarClock class="w-3.5 h-3.5" />
          定刻順 <span class="hidden sm:inline">(ダイヤ通り)</span>
        </button>
      </div>
    </div>

    <div class="divide-y divide-slate-100 max-h-[28rem] overflow-y-auto px-2 pb-2 pt-1 scrollbar-thin">
      <template v-for="(bus, index) in timetable" :key="`${bus.routeId}-${index}`">
        <BusTimetableRow
          :bus="bus"
          :isNext="index === nextBusIndex"
          :sortType="sortType"
        />
      </template>

      <div v-if="timetable.length > 0 && timetable.every(b => b.isPast)" class="p-10 text-center text-slate-400 text-sm font-medium">表示できるバスがありません</div>
      <div v-if="timetable.length === 0" class="p-10 text-center text-slate-400 text-sm font-medium">この区間の運行はありません</div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { Clock, CalendarClock } from "lucide-vue-next";
  import type { TimetableEntry } from "@/composables/bus/useBusTimetable";

  defineProps<{
    /** 統合時刻表データ */
    timetable: TimetableEntry[];
    /** 先発バスのインデックス */
    nextBusIndex: number;
    /** 表示順序 */
    sortType: "estimated" | "scheduled";
    /** 選択された降車バス停 */
    selectedDropOffStop: string;
  }>();

  defineEmits<{
    "update:sortType": [value: "estimated" | "scheduled"];
  }>();
</script>
