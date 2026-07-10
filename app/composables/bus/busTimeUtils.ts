/**
 * バス時刻表 時刻ユーティリティ
 *
 * 時刻文字列のパース、フォーマット、加算を行うヘルパー関数群。
 */

/**
 * "HH:mm" 形式の文字列を Date オブジェクトに変換する
 *
 * @param timeStr - "HH:mm" 形式の時刻文字列
 * @param baseDate - 基準日 (省略時は現在日)
 */
export function parseTime(timeStr: string, baseDate = new Date()): Date {
  const parts = timeStr.split(":").map(Number);
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Date オブジェクトを "HH:mm" 形式の文字列にフォーマットする
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Date オブジェクトに指定分数を加算した新しい Date を返す
 */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}
