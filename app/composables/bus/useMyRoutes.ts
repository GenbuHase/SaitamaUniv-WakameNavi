/**
 * マイルート (localStorage) 管理 composable
 */

import { ref, computed } from "vue";
import { useRoute, navigateTo } from "#imports";
import { isKnownStopName } from "@@/shared/utils/Bus/v2/Routes";
import type { MyRoute } from "./busTypes";

const STORAGE_KEY = "@genbuhase/wakame-navi/my_routes";
const MAX_ROUTES = 20;
const MAX_PINNED = 3;

const myRoutes = ref<MyRoute[]>([]);
let isMyRoutesLoaded = false;

/**
 * MyRoute オブジェクトのスキーマバリデーション
 *
 * localStorageから読み込んだデータが改ざんされている可能性を考慮し、
 * 各フィールドの型と値を検証する。
 */
function isValidMyRoute(obj: unknown): obj is MyRoute {
  if (!obj || typeof obj !== "object") return false;
  const route = obj as Record<string, unknown>;

  return (
    typeof route.id === "string" && route.id.length > 0 && route.id.length <= 200 &&
    typeof route.boarding === "string" && route.boarding.length <= 100 &&
    typeof route.dropOff === "string" && route.dropOff.length <= 100 &&
    typeof route.isPinned === "boolean" &&
    typeof route.createdAt === "number" && Number.isFinite(route.createdAt)
  );
}

/** 停留所名が Routes.ts 由来のホワイトリストに含まれるか */
function hasValidStopNames(route: MyRoute): boolean {
  if (!route.boarding || !isKnownStopName(route.boarding)) return false;
  if (route.dropOff && !isKnownStopName(route.dropOff)) return false;
  return true;
}

function saveMyRoutes() {
  if (import.meta.client) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(myRoutes.value));
  }
}

export function useMyRoutes() {
  const route = useRoute();

  const pinnedRoutes = computed(() => {
    return myRoutes.value.filter(r => r.isPinned).slice(0, MAX_PINNED);
  });

  const loadMyRoutes = () => {
    if (import.meta.client && !isMyRoutesLoaded) {
      const routesJson = localStorage.getItem(STORAGE_KEY);
      if (routesJson) {
        try {
          const parsed = JSON.parse(routesJson);

          if (!Array.isArray(parsed)) {
            console.warn("マイルートデータが配列ではありません。初期化します。");
            myRoutes.value = [];
            isMyRoutesLoaded = true;
            return;
          }

          const schemaValid = parsed.filter(isValidMyRoute);
          const validRoutes = schemaValid.filter(hasValidStopNames);
          const dropped = parsed.length - validRoutes.length;
          if (dropped > 0) {
            console.warn(`マイルートデータに不正なエントリが ${dropped} 件含まれていたため除外しました。`);
          }

          myRoutes.value = validRoutes.slice(0, MAX_ROUTES);
          // ホワイトリスト除外後の内容を永続化してゴミを残さない
          if (dropped > 0) {
            saveMyRoutes();
          }
          isMyRoutesLoaded = true;
        } catch (e) {
          console.error("Failed to parse my routes:", e);
          myRoutes.value = [];
          isMyRoutesLoaded = true;
        }
      } else {
        isMyRoutesLoaded = true;
      }
    }
  };

  const addMyRoute = (boarding: string, dropOff: string = ""): string | null => {
    if (!boarding) return null;
    if (!isKnownStopName(boarding)) {
      return "乗車停留所が不正です。";
    }
    if (dropOff && !isKnownStopName(dropOff)) {
      return "降車停留所が不正です。";
    }

    const exists = myRoutes.value.some(r => r.boarding === boarding && r.dropOff === dropOff);
    if (exists) return null;

    if (myRoutes.value.length >= MAX_ROUTES) {
      return `マイルートは最大${MAX_ROUTES}件まで登録できます。`;
    }

    const newRoute: MyRoute = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substring(2, 9),
      boarding,
      dropOff,
      isPinned: false,
      createdAt: Date.now()
    };

    myRoutes.value.push(newRoute);
    saveMyRoutes();
    return null;
  };

  const removeMyRoute = (id: string) => {
    myRoutes.value = myRoutes.value.filter(r => r.id !== id);
    saveMyRoutes();
  };

  const togglePinRoute = (id: string): string | null => {
    const target = myRoutes.value.find(r => r.id === id);
    if (!target) return null;

    if (!target.isPinned) {
      const pinnedCount = myRoutes.value.filter(r => r.isPinned).length;
      if (pinnedCount >= MAX_PINNED) {
        return `ピン留め（お気に入りショートカット）は最大${MAX_PINNED}件までです。`;
      }
    }

    target.isPinned = !target.isPinned;
    saveMyRoutes();
    return null;
  };

  const updateMyRoutes = (newRoutes: MyRoute[]) => {
    myRoutes.value = newRoutes.filter(hasValidStopNames);
    saveMyRoutes();
  };

  const applyRoute = (boarding: string, dropOff: string = "") => {
    const query: Record<string, string> = {
      boarding,
      dropOff,
    };
    if (route.query.campaign !== undefined) {
      query.campaign = String(route.query.campaign);
    }
    if (route.query.local !== undefined) {
      query.local = String(route.query.local);
    }
    navigateTo({
      path: "/bus/result",
      query,
    });
  };

  const isRouteRegistered = (boarding: string, dropOff: string = "") => {
    return myRoutes.value.some(
      r => r.boarding === boarding && r.dropOff === dropOff
    );
  };

  const toggleMyRoute = (boarding: string, dropOff: string = ""): string | null => {
    if (isRouteRegistered(boarding, dropOff)) {
      const target = myRoutes.value.find(
        r => r.boarding === boarding && r.dropOff === dropOff
      );
      if (target) {
        removeMyRoute(target.id);
      }
      return null;
    }
    return addMyRoute(boarding, dropOff);
  };

  return {
    myRoutes,
    pinnedRoutes,
    loadMyRoutes,
    addMyRoute,
    removeMyRoute,
    togglePinRoute,
    updateMyRoutes,
    applyRoute,
    isRouteRegistered,
    toggleMyRoute,
  };
}
