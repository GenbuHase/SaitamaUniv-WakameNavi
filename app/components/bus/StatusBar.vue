<template>
  <section class="flex justify-between items-center px-2">
    <div class="text-xs text-emerald-600/80 font-medium flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100/50">
      <Clock class="w-3.5 h-3.5" />
      {{ formatTime(lastUpdated) }} 現在
    </div>
    <span v-if="hasDelay" class="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse shadow-sm">
      <AlertTriangle class="w-3.5 h-3.5" /> 遅延発生中
    </span>
  </section>
</template>

<script setup lang="ts">
  import { Clock, AlertTriangle } from "lucide-vue-next";
  import { formatTime } from "@/composables/bus/busTimeUtils";

  defineProps<{
    /** 最終更新時刻 */
    lastUpdated: Date;
    /** 遅延が発生しているか */
    hasDelay: boolean;
  }>();
</script>
