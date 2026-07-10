/**
 * バス時刻表 メイン composable（ファサード）
 *
 * ページ・コンポーネント向けの公開 API を集約する。
 * 実装は useMyRoutes / useTimetableData に分割している。
 */

import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRoute } from "#imports";

import { GENERATED_ROUTES, sortStopsByPriority } from "./busRouteData";
import { filterStopsByQuery } from "./busStopSearch";
import { formatTime } from "./busTimeUtils";
import { useMyRoutes } from "./useMyRoutes";
import { useTimetableData, BUS_API_POLL_INTERVAL_MS } from "./useTimetableData";

export type { TimetableEntry, MyRoute } from "./busTypes";
export { BUS_API_POLL_INTERVAL_MS };

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// グローバル（シングルトン）ステート
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// UI入力用 (検索ボタンを押すまで確定しない)
const boardingStopInput = ref("");
const dropOffStopInput = ref("");

// 確定した検索条件
const selectedBoardingStop = ref("");
const selectedDropOffStop = ref("");

const currentTime = ref(new Date());

// マイルート操作のインライン通知（alert の代替）
const noticeMessage = ref<string | null>(null);
let noticeTimer: ReturnType<typeof setTimeout> | null = null;

function showNotice(message: string | null) {
  if (noticeTimer) {
    clearTimeout(noticeTimer);
    noticeTimer = null;
  }
  noticeMessage.value = message;
  if (message) {
    noticeTimer = setTimeout(() => {
      noticeMessage.value = null;
      noticeTimer = null;
    }, 4000);
  }
}

// タイマー管理のシングルトン化
let globalTimer: ReturnType<typeof setInterval> | null = null;
let timerRefCount = 0;

function startGlobalTimer() {
  timerRefCount++;
  if (!globalTimer) {
    globalTimer = setInterval(() => {
      currentTime.value = new Date();
    }, 1000);
  }
}

function stopGlobalTimer() {
  timerRefCount--;
  if (timerRefCount <= 0 && globalTimer) {
    clearInterval(globalTimer);
    globalTimer = null;
    timerRefCount = 0;
  }
}

export function useBusTimetable() {
  const route = useRoute();

  const isLocalMode = computed(() => route.query.local !== undefined);

  const {
    myRoutes,
    pinnedRoutes,
    loadMyRoutes,
    addMyRoute: addMyRouteRaw,
    removeMyRoute,
    togglePinRoute: togglePinRouteRaw,
    updateMyRoutes,
    applyRoute,
    isRouteRegistered,
    toggleMyRoute: toggleMyRouteRaw,
  } = useMyRoutes();

  const {
    lastUpdated,
    isLoading,
    fetchError,
    sortType,
    refreshData,
    integratedTimetable,
    nextBus,
    nextBusIndex,
    hasDelayInUpcoming,
  } = useTimetableData({
    selectedBoardingStop,
    selectedDropOffStop,
    currentTime,
    isLocalMode,
  });

  // --- 全バス停リスト ---

  const allStops = computed(() => {
    const stopsSet = new Set<string>();
    GENERATED_ROUTES.forEach(r => {
      r.stops.forEach(stop => stopsSet.add(stop.name));
    });
    return Array.from(stopsSet).sort(sortStopsByPriority);
  });

  // --- 降車バス停の選択肢 ---

  const availableDropOffStops = computed(() => {
    const possibleStops = new Set<string>();
    GENERATED_ROUTES.forEach(r => {
      const boardingIndex = r.stops.findIndex(s => s.name === boardingStopInput.value);
      if (boardingIndex !== -1 && boardingIndex < r.stops.length - 1) {
        for (let i = boardingIndex + 1; i < r.stops.length; i++) {
          const stop = r.stops[i];
          if (stop) possibleStops.add(stop.name);
        }
      }
    });
    return Array.from(possibleStops).sort(sortStopsByPriority);
  });

  // --- 検索フィルタリング ---

  const filteredBoardingStops = computed(() =>
    filterStopsByQuery(allStops.value, boardingStopInput.value)
  );

  const filteredDropOffStops = computed(() =>
    filterStopsByQuery(availableDropOffStops.value, dropOffStopInput.value)
  );

  // --- 停留所およびルートの検証 ---

  const isBoardingStopInvalid = computed(() => {
    return boardingStopInput.value !== "" && !allStops.value.includes(boardingStopInput.value);
  });

  const isDropOffStopInvalid = computed(() => {
    return dropOffStopInput.value !== "" && !allStops.value.includes(dropOffStopInput.value);
  });

  const isRouteInvalid = computed(() => {
    if (isBoardingStopInvalid.value || isDropOffStopInvalid.value) return true;
    if (boardingStopInput.value && dropOffStopInput.value) {
      return !availableDropOffStops.value.includes(dropOffStopInput.value);
    }
    return false;
  });

  // --- バス停ごとの通過系統マップ ---

  const stopRoutesMap = computed(() => {
    const map: Record<string, string[]> = {};
    GENERATED_ROUTES.forEach(r => {
      r.stops.forEach(s => {
        const codes = map[s.name] ?? (map[s.name] = []);
        if (!codes.includes(r.code)) {
          codes.push(r.code);
        }
      });
    });
    for (const stop of Object.keys(map)) {
      map[stop]?.sort();
    }
    return map;
  });

  onMounted(() => {
    startGlobalTimer();
    loadMyRoutes();
    // 検索ページでは API を叩かない（結果ページの handleSearch / ポーリングで取得）
  });

  onUnmounted(() => {
    stopGlobalTimer();
  });

  // --- 検索実行 ---

  const handleSearch = () => {
    selectedBoardingStop.value = boardingStopInput.value;
    selectedDropOffStop.value = dropOffStopInput.value;
    return refreshData();
  };

  // --- 入力変更の監視 ---

  let isSwapping = false;
  let isSyncing = false;

  watch(boardingStopInput, (newVal, oldVal) => {
    if (newVal !== oldVal && !isSwapping && !isSyncing) {
      dropOffStopInput.value = "";
    }
  });

  const setStops = (boarding: string, dropOff: string = "") => {
    isSyncing = true;
    boardingStopInput.value = boarding;
    dropOffStopInput.value = dropOff;
    nextTick(() => {
      isSyncing = false;
    });
  };

  // --- バス停入れ替え ---

  const swapStops = () => {
    if (dropOffStopInput.value) {
      isSwapping = true;
      const temp = boardingStopInput.value;
      boardingStopInput.value = dropOffStopInput.value;
      dropOffStopInput.value = temp;
      setTimeout(() => { isSwapping = false; }, 0);
    }
  };

  const addMyRoute = (boarding: string, dropOff: string = "") => {
    const error = addMyRouteRaw(boarding, dropOff);
    if (error) showNotice(error);
  };

  const togglePinRoute = (id: string) => {
    const error = togglePinRouteRaw(id);
    if (error) showNotice(error);
  };

  const toggleMyRoute = (boarding: string, dropOff: string = "") => {
    const error = toggleMyRouteRaw(boarding, dropOff);
    if (error) showNotice(error);
  };

  const applyRouteWithStops = (boarding: string, dropOff: string = "") => {
    setStops(boarding, dropOff);
    applyRoute(boarding, dropOff);
  };

  const clearFetchError = () => {
    fetchError.value = null;
  };

  const clearNotice = () => {
    showNotice(null);
  };

  // --- 公開API ---

  return {
    // ステート
    boardingStopInput,
    dropOffStopInput,
    selectedBoardingStop,
    selectedDropOffStop,
    currentTime,
    lastUpdated,
    isLoading,
    fetchError,
    sortType,
    noticeMessage,

    // マイルートステート＆メソッド
    myRoutes,
    pinnedRoutes,
    addMyRoute,
    removeMyRoute,
    togglePinRoute,
    updateMyRoutes,
    applyRoute: applyRouteWithStops,
    isRouteRegistered,
    toggleMyRoute,

    // 算出プロパティ
    allStops,
    availableDropOffStops,
    filteredBoardingStops,
    filteredDropOffStops,
    stopRoutesMap,
    integratedTimetable,
    nextBusIndex,
    nextBus,
    hasDelayInUpcoming,
    isBoardingStopInvalid,
    isDropOffStopInvalid,
    isRouteInvalid,

    // メソッド
    handleSearch,
    refreshData,
    swapStops,
    setStops,
    clearFetchError,
    clearNotice,

    // ユーティリティ (テンプレートで直接使用)
    formatTime,
  };
}
