<template>
  <div>
    <label
      :id="`${idPrefix}-label`"
      :for="`${idPrefix}-input`"
      class="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1"
    >
      <div class="p-1 rounded-full" :class="labelColor === 'blue' ? 'bg-blue-50' : 'bg-red-50'">
        <MapPin class="w-3 h-3" :class="labelColor === 'blue' ? 'text-blue-500' : 'text-red-500'" />
      </div>
      {{ label }}
    </label>
    <div class="relative group">
      <input
        :id="`${idPrefix}-input`"
        type="text"
        role="combobox"
        :aria-labelledby="`${idPrefix}-label`"
        :aria-expanded="isDropdownOpen && !disabled"
        :aria-controls="`${idPrefix}-listbox`"
        :aria-activedescendant="activeDescendantId"
        aria-autocomplete="list"
        :aria-haspopup="true"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @focus="isDropdownOpen = true"
        @click="isDropdownOpen = true"
        @blur="isDropdownOpen = false"
        @keydown="handleKeyDown"
        :disabled="disabled"
        :placeholder="placeholder"
        class="w-full p-3.5 pl-4 pr-16 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium text-slate-700 disabled:bg-slate-100/50 disabled:text-slate-400 disabled:opacity-60 transition-all duration-300"
        autocomplete="off"
      />
      <div class="absolute right-2 top-0 bottom-0 flex items-center gap-0.5">
        <button
          v-show="modelValue"
          type="button"
          @mousedown.prevent="$emit('update:modelValue', '')"
          class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors"
          :disabled="disabled"
          title="クリア"
          :aria-label="`${label}をクリア`"
        >
          <X class="w-4 h-4" />
        </button>
        <ChevronDown
          class="w-5 h-5 text-slate-400 pointer-events-none transition-transform duration-300 group-focus-within:text-emerald-500 mr-2"
          :class="{ 'rotate-180': isDropdownOpen }"
          aria-hidden="true"
        />
      </div>

      <transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="transform scale-95 opacity-0 translate-y-[-10px]"
        enter-to-class="transform scale-100 opacity-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="transform scale-100 opacity-100 translate-y-0"
        leave-to-class="transform scale-95 opacity-0 translate-y-[-10px]"
      >
        <div
          v-if="isDropdownOpen && !disabled"
          :id="`${idPrefix}-dropdown-container`"
          class="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] max-h-60 overflow-auto"
        >
          <ul
            :id="`${idPrefix}-listbox`"
            role="listbox"
            :aria-labelledby="`${idPrefix}-label`"
            class="py-1.5"
          >
            <!-- 先頭固定項目 (「指定なし」など) -->
            <li
              v-if="prependOption"
              :id="`${idPrefix}-stop-0`"
              role="option"
              :aria-selected="activeIndex === 0"
              @mousedown.prevent="handleSelect(prependOption.value)"
              @mouseenter="activeIndex = 0"
              class="px-4 py-3 text-sm font-bold cursor-pointer border-b border-slate-50/50 flex items-center gap-2 transition-colors"
              :class="activeIndex === 0 ? 'bg-slate-50 text-slate-700' : 'text-slate-500 hover:bg-slate-50'"
            >
              <span class="w-2 h-2 rounded-full bg-slate-300" aria-hidden="true"></span>
              {{ prependOption.label }}
            </li>

            <li v-if="stops.length === 0" class="px-4 py-4 text-sm text-slate-500 text-center" role="presentation">
              見つかりませんでした
            </li>

            <li
              v-for="(stop, index) in stops"
              :id="`${idPrefix}-stop-${index + indexOffset}`"
              :key="stop"
              role="option"
              :aria-selected="activeIndex === index + indexOffset"
              @mousedown.prevent="handleSelect(stop)"
              @mouseenter="activeIndex = index + indexOffset"
              class="px-4 py-3 cursor-pointer transition-colors group border-b border-slate-50/50 last:border-0"
              :class="activeIndex === index + indexOffset ? 'bg-emerald-50/50' : 'hover:bg-emerald-50/50'"
            >
              <div
                class="text-sm font-medium transition-colors"
                :class="activeIndex === index + indexOffset ? 'text-emerald-700' : 'text-slate-700 group-hover:text-emerald-700'"
              >{{ stop }}</div>
              <div class="text-[10px] text-slate-400 mt-0.5 truncate tracking-wide" title="運行系統">
                {{ stopRoutesMap[stop]?.join(", ") }}
              </div>
            </li>
          </ul>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, nextTick } from "vue";
  import { MapPin, ChevronDown, X } from "lucide-vue-next";

  const props = withDefaults(defineProps<{
    /** 入力値 (v-model) */
    modelValue: string;
    /** フィルタ済みバス停リスト */
    stops: string[];
    /** 各バス停の通過路線マップ */
    stopRoutesMap: Record<string, string[]>;
    /** プレースホルダーテキスト */
    placeholder?: string;
    /** 無効化フラグ */
    disabled?: boolean;
    /** ラベルテキスト ("出発" / "到着") */
    label: string;
    /** ラベルアイコンの色 */
    labelColor: "blue" | "red";
    /** DOM ID接頭辞 ("boarding" / "dropoff") */
    idPrefix: string;
    /** 先頭に追加する固定項目 (降車の「指定なし」用) */
    prependOption?: { label: string; value: string };
  }>(), {
    placeholder: "バス停名を入力または選択",
    disabled: false,
  });

  const emit = defineEmits<{
    "update:modelValue": [value: string];
  }>();

  // --- 内部状態 ---
  const isDropdownOpen = ref(false);
  const activeIndex = ref(-1);

  /** prependOptionがある場合、通常のstopsのインデックスは1ずれる */
  const indexOffset = computed(() => (props.prependOption ? 1 : 0));

  /** aria-activedescendant 用のアクティブオプション ID */
  const activeDescendantId = computed(() => {
    if (!isDropdownOpen.value || props.disabled || activeIndex.value < 0) {
      return undefined;
    }
    return `${props.idPrefix}-stop-${activeIndex.value}`;
  });

  // modelValue変更時にactiveIndexをリセット
  watch(() => props.modelValue, () => {
    activeIndex.value = -1;
  });

  // --- 選択処理 ---
  const handleSelect = (stop: string) => {
    emit("update:modelValue", stop);
    isDropdownOpen.value = false;
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  // --- スクロール制御 ---
  const scrollToActive = () => {
    nextTick(() => {
      const container = document.getElementById(`${props.idPrefix}-dropdown-container`);
      const element = document.getElementById(`${props.idPrefix}-stop-${activeIndex.value}`);
      if (container && element) {
        const cRect = container.getBoundingClientRect();
        const eRect = element.getBoundingClientRect();
        if (eRect.bottom > cRect.bottom) {
          container.scrollTop += eRect.bottom - cRect.bottom;
        } else if (eRect.top < cRect.top) {
          container.scrollTop -= cRect.top - eRect.top;
        }
      }
    });
  };

  // --- キーボードナビゲーション ---
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isDropdownOpen.value) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        isDropdownOpen.value = true;
      }
      return;
    }

    const allItems = props.prependOption
      ? [props.prependOption.value, ...props.stops]
      : [...props.stops];
    const maxIndex = allItems.length - 1;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex.value = activeIndex.value < maxIndex ? activeIndex.value + 1 : 0;
      scrollToActive();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex.value = activeIndex.value > 0 ? activeIndex.value - 1 : maxIndex;
      scrollToActive();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex.value >= 0 && activeIndex.value <= maxIndex) {
        const selected = allItems[activeIndex.value];
        if (selected !== undefined) {
          handleSelect(selected);
        }
      }
    } else if (e.key === "Escape") {
      isDropdownOpen.value = false;
    }
  };
</script>
