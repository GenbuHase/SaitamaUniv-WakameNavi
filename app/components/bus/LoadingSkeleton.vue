<template>
  <div class="space-y-6 pb-4 animate-pulse">
    <!-- 運行状況要約（スケルトン） -->
    <section class="flex justify-between items-center px-2">
      <div class="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/50">
        <Clock class="w-3.5 h-3.5 text-slate-300" />
        <div class="h-3 w-16 bg-slate-200 rounded"></div>
      </div>
      <div class="h-6 w-20 bg-slate-100 rounded-full border border-slate-200/50"></div>
    </section>

    <!-- 次のバス（NextCardのスケルトン） -->
    <section class="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-7 relative overflow-hidden">
      <!-- 本物と同じ装飾用背景サークル -->
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-slate-200/10 rounded-full blur-3xl pointer-events-none"></div>

      <!-- 会社ロゴプレースホルダー -->
      <div class="absolute top-5 right-5 px-2.5 py-1 bg-slate-200/60 rounded-full border border-slate-300/30 w-20 h-6"></div>

      <!-- 背景バスアイコン -->
      <div class="absolute -bottom-6 -right-6 p-3 opacity-[0.03] transform -rotate-6">
        <Bus class="w-40 h-40 text-slate-900" />
      </div>

      <div class="relative z-10 space-y-4">
        <!-- 先発タグと停留所 -->
        <div class="flex items-center gap-2.5">
          <div class="h-6 w-12 bg-slate-200 rounded-full"></div>
          <div class="h-4 w-32 bg-slate-200 rounded"></div>
        </div>

        <!-- 予測時刻 -->
        <div class="h-16 w-44 bg-slate-200 rounded-2xl"></div>

        <!-- 定刻・遅延情報 -->
        <div class="flex items-center gap-3">
          <div class="h-6 w-24 bg-slate-200 rounded-md"></div>
          <div class="h-6 w-20 bg-slate-200 rounded-md"></div>
        </div>

        <!-- 系統と目的地 -->
        <div class="pt-4 border-t border-slate-200/60 flex items-center gap-3">
          <div class="h-6 w-12 bg-slate-200 rounded-md"></div>
          <div class="h-7 w-40 bg-slate-200 rounded-md"></div>
        </div>
      </div>
    </section>

    <!-- 時刻表（Timetableのスケルトン） -->
    <section class="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
      <!-- ヘッダー -->
      <div class="p-5 border-b border-slate-100 bg-[#f8fbf9]/50 flex flex-col gap-4">
        <div class="flex justify-between items-center px-1">
          <div class="h-5 w-24 bg-slate-200 rounded-md"></div>
          <div class="h-5 w-28 bg-slate-200 rounded-full"></div>
        </div>
        <!-- タブ切り替えスイッチプレースホルダー -->
        <div class="h-10 w-full bg-slate-200/50 rounded-[1.25rem]"></div>
      </div>

      <!-- リスト -->
      <div class="divide-y divide-slate-50 px-2 pb-2 pt-1">
        <div v-for="i in 3" :key="i" class="p-3 my-1 rounded-2xl flex justify-between items-center">
          <div class="flex items-start gap-4 w-full px-2">
            <!-- 時刻 -->
            <div class="flex flex-col items-center min-w-[4.5rem] pt-0.5 space-y-2">
              <div class="h-7 w-12 bg-slate-200 rounded-md"></div>
              <div class="h-3 w-10 bg-slate-150 rounded"></div>
            </div>
            <!-- 系統・行先情報 -->
            <div class="flex-1 min-w-0 pt-0.5 space-y-2.5">
              <div class="flex items-center gap-2">
                <div class="h-4 w-8 bg-slate-200 rounded-full"></div>
                <div class="h-4 w-12 bg-slate-200 rounded-full"></div>
              </div>
              <div class="h-5 w-36 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { Clock, Bus } from "lucide-vue-next";
</script>
