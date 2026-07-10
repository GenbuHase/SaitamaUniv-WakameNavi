<template>
  <Teleport to="body">
    <Transition name="notice-popup">
      <div
        v-if="message"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="notice-popup-title"
      >
        <div
          class="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
          @click="emit('close')"
        />
        <div
          class="relative w-full max-w-sm bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-amber-100/80 p-6 space-y-4"
        >
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
              <AlertCircle class="w-5 h-5 text-amber-500" />
            </div>
            <div class="flex-1 pt-1.5">
              <p id="notice-popup-title" class="text-sm font-bold text-slate-800 leading-relaxed">
                {{ message }}
              </p>
            </div>
          </div>
          <button
            type="button"
            class="w-full py-3 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white text-sm font-bold rounded-2xl transition-all duration-200 cursor-pointer"
            @click="emit('close')"
          >
            OK
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { AlertCircle } from "lucide-vue-next";

  defineProps<{
    message: string | null;
  }>();

  const emit = defineEmits<{
    close: [];
  }>();
</script>

<style scoped>
  .notice-popup-enter-active,
  .notice-popup-leave-active {
    transition: opacity 0.2s ease;
  }

  .notice-popup-enter-active > div:last-child,
  .notice-popup-leave-active > div:last-child {
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
  }

  .notice-popup-enter-from,
  .notice-popup-leave-to {
    opacity: 0;
  }

  .notice-popup-enter-from > div:last-child,
  .notice-popup-leave-to > div:last-child {
    opacity: 0;
    transform: scale(0.92) translateY(8px);
  }
</style>
