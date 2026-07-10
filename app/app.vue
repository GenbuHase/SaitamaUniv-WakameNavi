<template>
  <div class="min-h-screen pb-24 bg-[#f4f9f5] text-slate-700 font-sans" style="font-family: 'Inter', 'Zen Kaku Gothic New', sans-serif;">
    <!-- ヘッダー -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      <div class="max-w-xl mx-auto px-4 py-4 flex items-center justify-center">
        <h1 class="text-xl font-black tracking-wider bg-gradient-to-r from-emerald-700 to-green-500 bg-clip-text text-transparent drop-shadow-sm flex items-center gap-1.5">
          <span class="text-2xl">🌱</span> わかめナビ
        </h1>
      </div>
    </header>

    <!-- メインコンテンツ -->
    <NuxtPage keepalive class="max-w-xl mx-auto px-4 py-6 space-y-6" />

    <!-- フッター (Floating Island) -->
    <footer class="fixed bottom-6 left-4 right-4 max-w-xl mx-auto bg-white/95 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl border border-white/20 z-50 overflow-hidden safe-area-bottom">
      <nav class="grid grid-cols-3 h-16 relative">
        <NuxtLink :to="{ path: '/', query: trackingQuery }" class="flex flex-col items-center justify-center gap-1 transition-all duration-300 relative group" active-class="text-emerald-600" inactive-class="text-slate-400 hover:text-emerald-500 hover:bg-emerald-50/50">
          <Home class="w-6 h-6 transition-transform group-active:scale-90" />
          <span class="text-[10px] font-bold tracking-wide">ホーム</span>
        </NuxtLink>

        <NuxtLink :to="{ path: '/bus', query: trackingQuery }" class="flex flex-col items-center justify-center gap-1 transition-all duration-300 relative group" exact-active-class="text-emerald-600" inactive-class="text-slate-400 hover:text-emerald-500 hover:bg-emerald-50/50">
          <Bus class="w-6 h-6 transition-transform group-active:scale-90" />
          <span class="text-[10px] font-bold tracking-wide">バス</span>
        </NuxtLink>

        <div class="flex flex-col items-center justify-center gap-1 text-slate-300 cursor-not-allowed transition-all duration-300">
          <Train class="w-6 h-6" />
          <span class="text-[10px] font-bold tracking-wide">電車（準備中）</span>
        </div>
      </nav>
    </footer>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { useRoute } from "#imports";
  import { Home, Bus, Train } from "lucide-vue-next";
  import { normalizeQueryValue } from "@/utils/queryParams";

  const route = useRoute();
  const trackingQuery = computed(() => {
    const query: Record<string, string | string[] | undefined | null> = {};
    // 開発時のみ ?local をナビ遷移でも引き継ぐ
    if (import.meta.dev && route.query.local !== undefined) {
      query.local = normalizeQueryValue(route.query.local);
    }
    return query;
  });
</script>
