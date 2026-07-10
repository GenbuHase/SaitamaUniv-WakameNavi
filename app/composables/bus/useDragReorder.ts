/**
 * リストのドラッグ並べ替え用 composable
 *
 * MyRoutesPanel / PinnedRoutesPanel で共通利用する。
 */

import { ref, watch, type Ref } from "vue";

export type DragAxis = "vertical" | "horizontal";

export interface UseDragReorderOptions<T> {
  /** 外部ソース（親の配列） */
  source: Ref<T[]>;
  /** 並べ替え確定時のコールバック */
  onCommit: (items: T[]) => void;
  /** 閾値判定の軸（リストは vertical、ピン留め横並びは horizontal） */
  axis?: DragAxis;
}

export function useDragReorder<T>(options: UseDragReorderOptions<T>) {
  const { source, onCommit, axis = "vertical" } = options;

  const localItems = ref<T[]>([]) as Ref<T[]>;
  const draggedIndex = ref<number | null>(null);
  const draggableId = ref<string | null>(null);

  watch(
    source,
    (newVal) => {
      if (draggedIndex.value === null) {
        localItems.value = [...newVal];
      }
    },
    { immediate: true, deep: true }
  );

  const isItemDraggable = (id: string) => draggableId.value === id;

  const enableDrag = (id: string) => {
    draggableId.value = id;
  };

  const disableDrag = () => {
    if (draggedIndex.value === null) {
      draggableId.value = null;
    }
  };

  const onDragStart = (index: number, event: DragEvent) => {
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", index.toString());

      const target = event.currentTarget as HTMLElement;
      if (target) {
        target.style.opacity = "0.99";
      }
    }
    setTimeout(() => {
      draggedIndex.value = index;
    }, 0);
  };

  const onDragOver = (index: number, event: DragEvent) => {
    event.preventDefault();
    if (draggedIndex.value === null || draggedIndex.value === index) return;

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    if (axis === "vertical") {
      const relativeY = event.clientY - rect.top;
      const threshold = rect.height / 2;
      if (draggedIndex.value < index && relativeY < threshold) return;
      if (draggedIndex.value > index && relativeY > threshold) return;
    } else {
      const relativeX = event.clientX - rect.left;
      const threshold = rect.width / 2;
      if (draggedIndex.value < index && relativeX < threshold) return;
      if (draggedIndex.value > index && relativeX > threshold) return;
    }

    const target = localItems.value[draggedIndex.value];
    if (target === undefined) return;
    localItems.value.splice(draggedIndex.value, 1);
    localItems.value.splice(index, 0, target);
    draggedIndex.value = index;
  };

  /**
   * 表示用のサブセット（例: ピン留めのみ）を並べ替え、元配列へ反映する
   */
  const onSubsetDragOver = (
    index: number,
    event: DragEvent,
    subset: T[],
    getId: (item: T) => string
  ) => {
    event.preventDefault();
    if (draggedIndex.value === null || draggedIndex.value === index) return;

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    if (axis === "horizontal") {
      const relativeX = event.clientX - rect.left;
      const threshold = rect.width / 2;
      if (draggedIndex.value < index && relativeX < threshold) return;
      if (draggedIndex.value > index && relativeX > threshold) return;
    } else {
      const relativeY = event.clientY - rect.top;
      const threshold = rect.height / 2;
      if (draggedIndex.value < index && relativeY < threshold) return;
      if (draggedIndex.value > index && relativeY > threshold) return;
    }

    const pinnedList = [...subset];
    const draggedItem = pinnedList[draggedIndex.value];
    const targetItem = pinnedList[index];
    if (draggedItem === undefined || targetItem === undefined) return;

    const draggedIdxInAll = localItems.value.findIndex(r => getId(r) === getId(draggedItem));
    const targetIdxInAll = localItems.value.findIndex(r => getId(r) === getId(targetItem));

    if (draggedIdxInAll !== -1 && targetIdxInAll !== -1) {
      localItems.value[draggedIdxInAll] = targetItem;
      localItems.value[targetIdxInAll] = draggedItem;
      draggedIndex.value = index;
    }
  };

  const onDragEnd = () => {
    if (draggedIndex.value !== null) {
      onCommit([...localItems.value]);
    }
    draggedIndex.value = null;
    draggableId.value = null;
  };

  return {
    localItems,
    draggedIndex,
    isItemDraggable,
    enableDrag,
    disableDrag,
    onDragStart,
    onDragOver,
    onSubsetDragOver,
    onDragEnd,
  };
}
