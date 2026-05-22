/**
 * バス時刻表 メインcomposable
 *
 * バス時刻表ページのリアクティブステートとビジネスロジックを集約する。
 * テンプレートが必要とするすべてのデータと関数を提供する。
 */

import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "#imports";

import { KOKUSAI_ROUTES_DATA, SEIBU_ROUTES_DATA, GENERATED_ROUTES, sortStopsByPriority } from "./busRouteData";
import type { GeneratedRoute } from "./busRouteData";
import { filterStopsByQuery } from "./busStopSearch";
import { parseTime, formatTime, addMinutes } from "./busTimeUtils";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 型定義
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** 時刻表の各バスエントリ */
export interface TimetableEntry {
  routeId: string;
  routeCode: string;
  routeName: string;
  routeColor?: string;
  textColor: string;
  borderColor: string;
  company: "Kokusai" | "Seibu";
  destination: string;
  scheduledTime: string;
  estimatedTime: string;
  delay: number;
  scheduledDate: Date;
  estimatedDate: Date;
  isPast: boolean;
  boardingStopName: string;
}

/** マイルートのデータ構造 */
export interface MyRoute {
  id: string;
  boarding: string;
  dropOff: string;
  isPinned: boolean;
  createdAt: number;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// composable 本体
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function useBusTimetable() {
  const route = useRoute();

  // ローカルシミュレーションモード (?local)
  const isLocalMode = computed(() => route.query.local !== undefined);

  // --- リアクティブステート ---

  const apiStops = ref<any[]>([]);
  const apiServices = ref<any[]>([]);

  // UI入力用 (検索ボタンを押すまで確定しない)
  const boardingStopInput = ref("");
  const dropOffStopInput = ref("");

  // 確定した検索条件
  const selectedBoardingStop = ref("");
  const selectedDropOffStop = ref("");

  const busDelays = ref<Record<string, number>>({});
  const currentTime = ref(new Date());
  const lastUpdated = ref(new Date());
  const isLoading = ref(false);
  const sortType = ref<"estimated" | "scheduled">("estimated");

  // --- マイルート関連ステート ---
  const myRoutes = ref<MyRoute[]>([]);
  const pinnedRoutes = computed(() => {
    return myRoutes.value.filter(r => r.isPinned).slice(0, 3);
  });


  // --- 全バス停リスト ---

  const allStops = computed(() => {
    const stopsSet = new Set<string>();
    GENERATED_ROUTES.forEach(route => {
      route.stops.forEach(stop => stopsSet.add(stop.name));
    });
    return Array.from(stopsSet).sort(sortStopsByPriority);
  });

  // --- 降車バス停の選択肢 ---

  const availableDropOffStops = computed(() => {
    const possibleStops = new Set<string>();
    GENERATED_ROUTES.forEach(route => {
      const boardingIndex = route.stops.findIndex(s => s.name === boardingStopInput.value);
      if (boardingIndex !== -1 && boardingIndex < route.stops.length - 1) {
        for (let i = boardingIndex + 1; i < route.stops.length; i++) {
          possibleStops.add(route.stops[i].name);
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

  // --- バス停ごとの通過系統マップ ---

  const stopRoutesMap = computed(() => {
    const map: Record<string, string[]> = {};
    GENERATED_ROUTES.forEach(route => {
      route.stops.forEach(s => {
        if (!map[s.name]) {
          map[s.name] = [];
        }
        if (!map[s.name].includes(route.code)) {
          map[s.name].push(route.code);
        }
      });
    });
    for (const stop in map) {
      map[stop].sort();
    }
    return map;
  });

  // --- タイマー管理 ---

  let timer: ReturnType<typeof setInterval>;

  onMounted(async () => {
    timer = setInterval(() => {
      currentTime.value = new Date();
    }, 1000);

    // ローカルストレージからマイルートをロード
    loadMyRoutes();

    if (!isLocalMode.value) {
      try {
        apiStops.value = await $fetch("/api/v2/bus/stops");
      } catch (e) {
        console.error("Failed to fetch stops:", e);
      }
    }

    // 初回データロード
    refreshData();
  });


  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });

  // --- データ更新 ---

  const refreshData = async () => {
    isLoading.value = true;

    // API モード (デフォルト)
    if (!isLocalMode.value) {
      try {
        const getStopId = (stopName: string, company: "Kokusai" | "Seibu") => {
          let normalizedName = stopName;
          if (stopName === "北浦和駅" && company === "Kokusai") normalizedName = "北浦和駅西口";
          if (stopName === "北浦和駅西口" && company === "Seibu") normalizedName = "北浦和駅";

          const data = company === "Kokusai" ? KOKUSAI_ROUTES_DATA : SEIBU_ROUTES_DATA;
          for (const route in data) {
            const stop = data[route].find(s => s.name === normalizedName);
            if (stop) return stop.id;
          }
          return null;
        };

        const query: Record<string, string> = {};

        // 乗車バス停のID取得
        const kokusaiStartId = getStopId(selectedBoardingStop.value, "Kokusai");
        const seibuStartId = getStopId(selectedBoardingStop.value, "Seibu");

        let fetchKokusai = !!kokusaiStartId;
        let fetchSeibu = !!seibuStartId;

        // 降車バス停のID取得 (任意)
        if (selectedDropOffStop.value) {
          const kokusaiGoalId = getStopId(selectedDropOffStop.value, "Kokusai");
          const seibuGoalId = getStopId(selectedDropOffStop.value, "Seibu");

          if (!kokusaiGoalId) fetchKokusai = false;
          else if (fetchKokusai) query.kokusaiGoalId = kokusaiGoalId;

          if (!seibuGoalId) fetchSeibu = false;
          else if (fetchSeibu) query.seibuGoalId = seibuGoalId;
        }

        if (fetchKokusai && kokusaiStartId) query.kokusaiStartId = kokusaiStartId;
        if (fetchSeibu && seibuStartId) query.seibuStartId = seibuStartId;

        if (Object.keys(query).length > 0) {
          apiServices.value = await $fetch("/api/v2/bus/services", { query });
        } else {
          apiServices.value = [];
        }
      } catch (e) {
        console.error("API error:", e);
        apiServices.value = [];
      } finally {
        lastUpdated.value = new Date();
        isLoading.value = false;
      }
      return;
    }

    // ローカルシミュレーションモード
    setTimeout(() => {
      const newDelays: Record<string, number> = {};

      GENERATED_ROUTES.forEach(route => {
        route.baseSchedule.forEach((timeStr: string) => {
          const busId = `${route.id}_${timeStr}`;
          if (Math.random() < 0.3) {
            newDelays[busId] = Math.floor(Math.random() * 25) + 1;
          }
        });
      });

      busDelays.value = newDelays;
      lastUpdated.value = new Date();
      isLoading.value = false;
    }, 600);
  };

  // --- 検索実行 ---

  const handleSearch = () => {
    selectedBoardingStop.value = boardingStopInput.value;
    selectedDropOffStop.value = dropOffStopInput.value;
    refreshData();
  };

  // --- 統合時刻表 ---

  const integratedTimetable = computed<TimetableEntry[]>(() => {
    // API モード
    if (!isLocalMode.value) {
      const allBuses: TimetableEntry[] = apiServices.value.map((service: any, index: number) => {
        const company: "Kokusai" | "Seibu" = service.companyCode === "KokusaiKogyo" ? "Kokusai" : "Seibu";
        const styles = company === "Kokusai"
          ? { textColor: "text-green-700", borderColor: "border-green-700", color: "bg-green-700" }
          : { textColor: "text-cyan-600", borderColor: "border-cyan-600", color: "bg-cyan-600" };

        const scheduledDate = parseTime(service.scheduledTime, currentTime.value);
        const estimatedDate = parseTime(service.estimatedTime, currentTime.value);

        // 深夜・翌日またぎの補正
        if (scheduledDate.getHours() < 5 && currentTime.value.getHours() > 18) scheduledDate.setDate(scheduledDate.getDate() + 1);
        if (estimatedDate.getHours() < 5 && currentTime.value.getHours() > 18) estimatedDate.setDate(estimatedDate.getDate() + 1);

        return {
          routeId: `${service.route}_${service.scheduledTime}_${company}_${index}`,
          routeCode: service.route,
          routeName: service.destination,
          ...styles,
          company,
          destination: service.destination,
          scheduledTime: service.scheduledTime,
          estimatedTime: service.estimatedTime,
          delay: service.delay,
          scheduledDate,
          estimatedDate,
          isPast: estimatedDate < currentTime.value,
          boardingStopName: selectedBoardingStop.value
        };
      });

      return allBuses.sort((a, b) => {
        if (sortType.value === "estimated") {
          return a.estimatedDate.getTime() - b.estimatedDate.getTime();
        } else {
          return a.scheduledDate.getTime() - b.scheduledDate.getTime();
        }
      });
    }

    // ローカルシミュレーションモード
    let allBuses: TimetableEntry[] = [];

    GENERATED_ROUTES.forEach(route => {
      const boardingStopIndex = route.stops.findIndex(s => s.name === selectedBoardingStop.value);
      if (boardingStopIndex === -1) return;

      if (selectedDropOffStop.value) {
        const dropOffStopIndex = route.stops.findIndex(s => s.name === selectedDropOffStop.value);
        if (dropOffStopIndex === -1 || dropOffStopIndex <= boardingStopIndex) return;
      }

      const boardingStopInfo = route.stops[boardingStopIndex];

      const routeBuses: TimetableEntry[] = route.baseSchedule.map((timeStr: string) => {
        const originDate = parseTime(timeStr, currentTime.value);
        const stopScheduledDate = addMinutes(originDate, boardingStopInfo.offset);

        const busId = `${route.id}_${timeStr}`;
        const delay = busDelays.value[busId] || 0;

        const estimatedDate = addMinutes(stopScheduledDate, delay);
        const isPast = estimatedDate < currentTime.value;

        return {
          routeId: route.id,
          routeCode: route.code,
          routeName: route.name,
          routeColor: route.color,
          textColor: route.textColor,
          borderColor: route.borderColor,
          company: route.company,
          destination: route.destination,
          scheduledTime: formatTime(stopScheduledDate).slice(0, 5),
          estimatedTime: formatTime(estimatedDate),
          delay,
          scheduledDate: stopScheduledDate,
          estimatedDate,
          isPast,
          boardingStopName: selectedBoardingStop.value
        };
      });
      allBuses = [...allBuses, ...routeBuses];
    });

    return allBuses.sort((a, b) => {
      if (sortType.value === "estimated") {
        return a.estimatedDate.getTime() - b.estimatedDate.getTime();
      } else {
        return a.scheduledDate.getTime() - b.scheduledDate.getTime();
      }
    });
  });

  // --- 次発バス ---

  const nextBus = computed(() => {
    // 過去ではない（!isPast）バスを抽出
    const upcomingBuses = integratedTimetable.value.filter(item => !item.isPast);
    if (upcomingBuses.length === 0) return null;

    // estimatedDate が最も早いものを探す
    return upcomingBuses.reduce((earliest, current) => {
      return current.estimatedDate.getTime() < earliest.estimatedDate.getTime() ? current : earliest;
    }, upcomingBuses[0]);
  });

  const nextBusIndex = computed(() => {
    if (!nextBus.value) return -1;
    return integratedTimetable.value.findIndex(item => item.routeId === nextBus.value!.routeId);
  });

  const hasDelayInUpcoming = computed(() => {
    const startIndex = nextBusIndex.value !== -1 ? nextBusIndex.value : 0;
    return integratedTimetable.value.slice(startIndex).some(bus => bus.delay > 0);
  });

  // --- 入力変更の監視 ---

  let isSwapping = false;
  watch(boardingStopInput, (newVal, oldVal) => {
    if (newVal !== oldVal && !isSwapping) {
      dropOffStopInput.value = "";
    }
  });

  // --- バス停入れ替え ---

  const swapStops = () => {
    if (dropOffStopInput.value) {
      isSwapping = true;
      const temp = boardingStopInput.value;
      boardingStopInput.value = dropOffStopInput.value;
      dropOffStopInput.value = temp;
      // watchトリガー後にフラグをリセット
      setTimeout(() => { isSwapping = false; }, 0);
    }
  };

  // --- マイルート操作 ---

  const loadMyRoutes = () => {
    if (import.meta.client) {
      const routesJson = localStorage.getItem("@genbuhase/wakame-navi/my_routes");
      if (routesJson) {
        try {
          myRoutes.value = JSON.parse(routesJson);
        } catch (e) {
          console.error("Failed to parse my routes:", e);
        }
      }
    }
  };

  const saveMyRoutes = () => {
    if (import.meta.client) {
      localStorage.setItem("@genbuhase/wakame-navi/my_routes", JSON.stringify(myRoutes.value));
    }
  };

  const addMyRoute = (boarding: string, dropOff: string = "") => {
    if (!boarding) return;
    // 重複チェック
    const exists = myRoutes.value.some(r => r.boarding === boarding && r.dropOff === dropOff);
    if (exists) return;

    if (myRoutes.value.length >= 20) {
      alert("マイルートは最大20件まで登録できます。");
      return;
    }

    const newRoute: MyRoute = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substring(2, 9),
      boarding,
      dropOff,
      isPinned: false,
      createdAt: Date.now()
    };

    myRoutes.value.unshift(newRoute);
    saveMyRoutes();
  };

  const removeMyRoute = (id: string) => {
    myRoutes.value = myRoutes.value.filter(r => r.id !== id);
    saveMyRoutes();
  };

  const togglePinRoute = (id: string) => {
    const route = myRoutes.value.find(r => r.id === id);
    if (!route) return;

    if (!route.isPinned) {
      // 既に3件ピン留めされている場合は警告
      const pinnedCount = myRoutes.value.filter(r => r.isPinned).length;
      if (pinnedCount >= 3) {
        alert("ピン留め（お気に入りショートカット）は最大3件までです。");
        return;
      }
    }

    route.isPinned = !route.isPinned;
    saveMyRoutes();
  };

  const updateMyRoutes = (newRoutes: MyRoute[]) => {
    myRoutes.value = newRoutes;
    saveMyRoutes();
  };

  const applyRoute = (boarding: string, dropOff: string = "") => {
    boardingStopInput.value = boarding;
    dropOffStopInput.value = dropOff;
    handleSearch();
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
    sortType,

    // マイルートステート＆メソッド
    myRoutes,
    pinnedRoutes,
    addMyRoute,
    removeMyRoute,
    togglePinRoute,
    updateMyRoutes,
    applyRoute,

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

    // メソッド
    handleSearch,
    swapStops,

    // ユーティリティ (テンプレートで直接使用)
    formatTime,
  };
}
