<template>
  <div
    v-if="!(bus.isPast && !isNext)"
    class="p-3 my-1 rounded-2xl flex justify-between items-center transition-all duration-300"
    :class="isNext ? 'bg-emerald-50/80 border border-emerald-100 shadow-sm' : 'hover:bg-slate-50 border border-transparent hover:border-slate-100'"
  >
    <div class="flex items-start gap-4 w-full px-2">
      <!-- 時刻表示部 -->
      <div class="flex flex-col items-center min-w-[4.5rem] pt-0.5">
        <template v-if="sortType === 'estimated'">
          <span class="text-2xl font-black tabular-nums leading-none tracking-tight" :class="isNext ? 'text-emerald-800' : 'text-slate-700'">
            {{ bus.estimatedTime.slice(0, 5) }}
          </span>
          <span class="text-[10px] text-slate-400 mt-1.5 font-medium tracking-wide"> 定刻 {{ bus.scheduledTime }} </span>
        </template>
        <template v-else>
          <span class="text-2xl font-black tabular-nums leading-none tracking-tight" :class="isNext ? 'text-emerald-800' : 'text-slate-700'">
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
            {{ getCompanyShortLabel(bus.company) }}
          </span>

          <!-- 系統コードバッジ -->
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white shadow-sm" :class="[bus.textColor, bus.borderColor]">
            {{ bus.routeCode }}
          </span>

          <!-- 遅延情報バッジ -->
          <span v-if="bus.delay > 0" class="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-100 shadow-sm"> +{{ bus.delay }}分 </span>

          <!-- まもなく表示 -->
          <span v-if="isNext" class="ml-auto text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-sm animate-pulse whitespace-nowrap"> 先発 </span>
        </div>

        <div class="flex items-center text-slate-700 font-medium truncate mt-1">
          <span class="truncate text-base"> {{ bus.destination }} <span class="text-xs text-slate-400 font-normal ml-0.5">行</span> </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { TimetableEntry } from "@/composables/bus/useBusTimetable";
  import { getCompanyShortLabel } from "@/composables/bus/busCompany";

  defineProps<{
    /** バスデータ */
    bus: TimetableEntry;
    /** 先発バスかどうか */
    isNext: boolean;
    /** 表示順序 */
    sortType: "estimated" | "scheduled";
  }>();
</script>
