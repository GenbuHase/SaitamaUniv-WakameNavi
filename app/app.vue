<template>
  <div class="min-h-screen bg-gray-50 text-gray-800 font-sans pb-16">
    <!-- ヘッダー -->
    <header class="bg-slate-800 text-white shadow-md sticky top-0 z-50">
      <div class="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <h1 class="text-lg font-bold tracking-wider">わかめナビ🌱</h1>
        </div>
      </div>
    </header>

    <NuxtPage keepalive />

    <!-- ボトムナビゲーション -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      <div class="max-w-md mx-auto grid grid-cols-2 h-16">
        <NuxtLink to="/" class="flex flex-col items-center justify-center gap-1 transition-colors" active-class="text-blue-600" inactive-class="text-gray-400 hover:text-gray-600">
          <Home class="w-6 h-6" />
          <span class="text-xs font-bold">Home</span>
        </NuxtLink>

        <NuxtLink to="/bus" class="flex flex-col items-center justify-center gap-1 transition-colors" exact-active-class="text-blue-600" inactive-class="text-gray-400 hover:text-gray-600">
          <Bus class="w-6 h-6" />
          <span class="text-xs font-bold">バス検索</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
  import { Home, Bus } from "lucide-vue-next";
</script>
