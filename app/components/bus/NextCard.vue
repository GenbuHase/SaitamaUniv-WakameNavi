<template>
  <!-- 次のバス（ハイライト） -->
  <section v-if="bus" class="bg-gradient-to-br from-[#009140] to-emerald-700 text-white rounded-[2rem] shadow-[0_20px_40px_rgba(0,145,64,0.2)] p-7 relative overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,145,64,0.3)] hover:-translate-y-1">
    <!-- 装飾用背景サークル -->
    <div class="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

    <!-- 会社ロゴっぽい表示 -->
    <div class="absolute top-5 right-5 text-[10px] font-bold px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30 shadow-sm">
      {{ bus.company === "Kokusai" ? "国際興業バス" : "西武バス" }}
    </div>

    <div class="absolute -bottom-6 -right-6 p-3 opacity-10 transform -rotate-6">
      <Bus class="w-40 h-40 drop-shadow-2xl" />
    </div>

    <div class="relative z-10">
      <div class="flex items-center gap-2.5 mb-2 opacity-90">
        <span class="text-xs font-bold border border-white/40 px-2.5 py-1 rounded-full bg-black/10 backdrop-blur-sm shadow-sm tracking-widest">先発</span>
        <span class="text-sm font-medium tracking-wide">{{ bus.boardingStopName }} 発</span>
      </div>

      <div class="flex items-baseline gap-3 my-3">
        <span class="text-[3.5rem] leading-none font-black tracking-tight tabular-nums drop-shadow-md">
          {{ bus.estimatedTime.slice(0, 5) }}
          <span class="text-3xl ml-1 font-bold">{{ bus.estimatedTime.slice(6) }}</span>
        </span>
      </div>

      <div class="flex items-center gap-3 text-sm font-medium text-emerald-50/90 mb-5">
        <span class="bg-black/10 px-2 py-0.5 rounded-md backdrop-blur-sm">定刻: {{ bus.scheduledTime }}</span>
        <span v-if="bus.delay > 0" class="bg-red-500/90 backdrop-blur-md text-white px-2.5 py-0.5 rounded-md text-xs font-bold shadow-sm border border-red-400/50"> +{{ bus.delay }}分 遅れ </span>
      </div>

      <div class="pt-4 border-t border-white/20 flex items-center gap-3">
        <span class="bg-white text-emerald-800 font-bold px-2 py-1 rounded-md text-xs shadow-sm">
          {{ bus.routeCode }}
        </span>
        <span class="flex-1 font-bold text-xl tracking-wide drop-shadow-sm">{{ bus.destination }} <span class="text-sm font-medium opacity-80">行</span></span>
      </div>
    </div>
  </section>

  <!-- バスなし表示 -->
  <section v-else class="bg-emerald-50/50 border border-emerald-100 rounded-[2rem] p-10 text-center text-emerald-700/60 shadow-sm">
    <div class="flex justify-center mb-3 opacity-50"><Bus class="w-12 h-12" /></div>
    <p class="font-bold text-lg">該当するバスがありません</p>
    <p class="text-xs mt-2 opacity-80">条件を変更するか、本日の運行を終了している可能性があります。</p>
  </section>
</template>

<script setup lang="ts">
  import { Bus } from "lucide-vue-next";
  import type { TimetableEntry } from "@/composables/bus/useBusTimetable";

  defineProps<{
    /** 先発バスのデータ (null時は空状態を表示) */
    bus: TimetableEntry | null;
  }>();
</script>
