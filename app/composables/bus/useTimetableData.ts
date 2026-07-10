/**
 * バス運行 API 取得 + 時刻表変換 composable
 */

import { ref, computed, type Ref, type ComputedRef } from "vue";
import type { BusService } from "@@/shared/types/bus";
import { normalizeStopNameForCompany } from "@@/shared/utils/Bus/v2/Routes";
import { KOKUSAI_ROUTES_DATA, SEIBU_ROUTES_DATA, GENERATED_ROUTES } from "./busRouteData";
import { parseTime, formatTime, addMinutes } from "./busTimeUtils";
import { toUiCompany, getCompanyStyles, type UiCompanyCode } from "./busCompany";
import type { TimetableEntry } from "./busTypes";

/** API ポーリング間隔 (ミリ秒) */
export const BUS_API_POLL_INTERVAL_MS = 45_000;

const apiServices = ref<BusService[]>([]);
const busDelays = ref<Record<string, number>>({});
const lastUpdated = ref(new Date());
const isLoading = ref(false);
const fetchError = ref<string | null>(null);
const sortType = ref<"estimated" | "scheduled">("estimated");

function getStopId(stopName: string, company: UiCompanyCode): string | null {
  const normalizedName = normalizeStopNameForCompany(stopName, company);

  const data = company === "Kokusai" ? KOKUSAI_ROUTES_DATA : SEIBU_ROUTES_DATA;
  for (const routeCode of Object.keys(data)) {
    const stops = data[routeCode];
    if (!stops) continue;
    const stop = stops.find(s => s.name === normalizedName);
    if (stop) return stop.id;
  }
  return null;
}

function buildServicesQuery(boarding: string, dropOff: string): Record<string, string> | null {
  if (!boarding) return null;

  const query: Record<string, string> = {};

  const kokusaiStartId = getStopId(boarding, "Kokusai");
  const seibuStartId = getStopId(boarding, "Seibu");

  let fetchKokusai = !!kokusaiStartId;
  let fetchSeibu = !!seibuStartId;

  if (dropOff) {
    const kokusaiGoalId = getStopId(dropOff, "Kokusai");
    const seibuGoalId = getStopId(dropOff, "Seibu");

    if (!kokusaiGoalId) fetchKokusai = false;
    else if (fetchKokusai) query.kokusaiGoalId = kokusaiGoalId;

    if (!seibuGoalId) fetchSeibu = false;
    else if (fetchSeibu) query.seibuGoalId = seibuGoalId;
  }

  if (fetchKokusai && kokusaiStartId) query.kokusaiStartId = kokusaiStartId;
  if (fetchSeibu && seibuStartId) query.seibuStartId = seibuStartId;

  return Object.keys(query).length > 0 ? query : null;
}

function formatFetchError(e: unknown): string {
  if (e && typeof e === "object") {
    const err = e as { statusCode?: number; status?: number; data?: unknown; message?: string };
    const status = err.statusCode ?? err.status;
    if (status === 429) {
      return "リクエストが多すぎます。しばらく待ってから再試行してください。";
    }
    if (status === 503) {
      return "一時的にサービスを利用できません。しばらく待ってから再試行してください。";
    }
    if (typeof err.data === "string" && err.data) return err.data;
    if (err.message) return err.message;
  }
  return "運行情報の取得に失敗しました。再試行してください。";
}

export interface UseTimetableDataOptions {
  selectedBoardingStop: Ref<string>;
  selectedDropOffStop: Ref<string>;
  currentTime: Ref<Date>;
  isLocalMode: ComputedRef<boolean>;
}

export function useTimetableData(options: UseTimetableDataOptions) {
  const { selectedBoardingStop, selectedDropOffStop, currentTime, isLocalMode } = options;

  const refreshData = async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent === true;
    if (!silent) {
      isLoading.value = true;
    }
    fetchError.value = null;

    if (!isLocalMode.value) {
      try {
        const query = buildServicesQuery(selectedBoardingStop.value, selectedDropOffStop.value);

        if (query) {
          apiServices.value = await $fetch<BusService[]>("/api/v2/bus/services", { query });
        } else {
          apiServices.value = [];
        }
      } catch (e) {
        console.error("[useTimetableData] API error:", e);
        fetchError.value = formatFetchError(e);
        // 初回失敗時は空配列、ポーリング中の失敗は前回データを保持
        if (!silent) {
          apiServices.value = [];
        }
      } finally {
        lastUpdated.value = new Date();
        isLoading.value = false;
      }
      return;
    }

    // ローカルシミュレーションモード
    await new Promise<void>(resolve => {
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
        resolve();
      }, 600);
    });
  };

  const integratedTimetable = computed<TimetableEntry[]>(() => {
    if (!isLocalMode.value) {
      const allBuses: TimetableEntry[] = apiServices.value.map((service: BusService, index: number) => {
        const company = toUiCompany(service.companyCode);
        const styles = getCompanyStyles(company);

        const scheduledDate = parseTime(service.scheduledTime, currentTime.value);
        const estimatedDate = parseTime(service.estimatedTime, currentTime.value);

        if (scheduledDate.getHours() < 5 && currentTime.value.getHours() > 18) scheduledDate.setDate(scheduledDate.getDate() + 1);
        if (estimatedDate.getHours() < 5 && currentTime.value.getHours() > 18) estimatedDate.setDate(estimatedDate.getDate() + 1);

        const isTimePast = estimatedDate < currentTime.value;
        const isStillActive = service.location &&
          (service.location.status === "running" ||
           service.location.status === "approaching" ||
           service.location.status === "not_departed");

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
          isPast: isTimePast && !isStillActive,
          boardingStopName: selectedBoardingStop.value
        };
      });

      return allBuses.sort((a, b) => {
        if (sortType.value === "estimated") {
          return a.estimatedDate.getTime() - b.estimatedDate.getTime();
        }
        return a.scheduledDate.getTime() - b.scheduledDate.getTime();
      });
    }

    let allBuses: TimetableEntry[] = [];

    GENERATED_ROUTES.forEach(route => {
      const boardingStopIndex = route.stops.findIndex(s => s.name === selectedBoardingStop.value);
      if (boardingStopIndex === -1) return;

      if (selectedDropOffStop.value) {
        const dropOffStopIndex = route.stops.findIndex(s => s.name === selectedDropOffStop.value);
        if (dropOffStopIndex === -1 || dropOffStopIndex <= boardingStopIndex) return;
      }

      const boardingStopInfo = route.stops[boardingStopIndex];
      if (!boardingStopInfo) return;

      const routeBuses: TimetableEntry[] = route.baseSchedule.map((timeStr: string) => {
        const originDate = parseTime(timeStr, currentTime.value);
        const stopScheduledDate = addMinutes(originDate, boardingStopInfo.offset);

        const busId = `${route.id}_${timeStr}`;
        const delay = busDelays.value[busId] || 0;

        const estimatedDate = addMinutes(stopScheduledDate, delay);
        const isPast = estimatedDate < currentTime.value;

        return {
          routeId: `${route.id}_${timeStr}`,
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
      }
      return a.scheduledDate.getTime() - b.scheduledDate.getTime();
    });
  });

  const nextBus = computed((): TimetableEntry | null => {
    const upcomingBuses = integratedTimetable.value.filter(item => !item.isPast);
    const first = upcomingBuses[0];
    if (!first) return null;

    return upcomingBuses.reduce((earliest, current) => {
      return current.estimatedDate.getTime() < earliest.estimatedDate.getTime() ? current : earliest;
    }, first);
  });

  const nextBusIndex = computed(() => {
    if (!nextBus.value) return -1;
    return integratedTimetable.value.findIndex(item => item.routeId === nextBus.value!.routeId);
  });

  const hasDelayInUpcoming = computed(() => {
    const startIndex = nextBusIndex.value !== -1 ? nextBusIndex.value : 0;
    return integratedTimetable.value.slice(startIndex).some(bus => bus.delay > 0);
  });

  return {
    lastUpdated,
    isLoading,
    fetchError,
    sortType,
    refreshData,
    integratedTimetable,
    nextBus,
    nextBusIndex,
    hasDelayInUpcoming,
  };
}
