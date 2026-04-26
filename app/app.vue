<template>
  <div class="min-h-screen pb-16 bg-gray-50 text-gray-600">
    <!-- ヘッダー -->
    <header class="sticky top-0 z-50 bg-slate-800 text-white shadow-md">
      <div class="max-w-xl mx-auto px-4 py-4">
        <h1 class="text-lg font-bold tracking-wider">🌱 わかめナビ</h1>
      </div>
    </header>

    <!-- メインコンテンツ -->
    <NuxtPage keepalive class="max-w-xl mx-auto px-4 py-6 space-y-6" />

    <!-- フッター -->
    <footer class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      <nav class="max-w-xl mx-auto grid grid-cols-3 h-16">
        <NuxtLink to="/" class="flex flex-col items-center justify-center gap-1 transition-colors" active-class="text-blue-600" inactive-class="text-gray-400 hover:text-gray-600">
          <Home class="w-6 h-6" />
          <span class="text-xs font-bold">Home</span>
        </NuxtLink>

        <NuxtLink to="/bus" class="flex flex-col items-center justify-center gap-1 transition-colors" exact-active-class="text-blue-600" inactive-class="text-gray-400 hover:text-gray-600">
          <Bus class="w-6 h-6" />
          <span class="text-xs font-bold">バス</span>
        </NuxtLink>

        <div to="/train" class="flex flex-col items-center justify-center gap-1 text-gray-300 cursor-not-allowed">
          <Train class="w-6 h-6" />
          <span class="text-xs font-bold">電車 (開発中)</span>
        </div>
      </nav>
    </footer>
  </div>
</template>

<script setup lang="ts">
  import { Home, Bus, Train } from "lucide-vue-next";
</script>
