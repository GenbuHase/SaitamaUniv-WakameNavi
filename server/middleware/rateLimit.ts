/**
 * レート制限 ミドルウェア
 *
 * APIエンドポイントへのリクエスト頻度を制限する。
 * IPアドレスごとにリクエスト数をカウントし、閾値を超えた場合に 429 を返す。
 *
 * ⚠️ 注意: インメモリ方式のため、Vercel Serverless環境では
 * ファンクションインスタンスごとの制限となる。完全なレート制限には
 * Redis (Upstash等) を利用したKVストアが推奨される。
 */

/** レート制限設定 */
const RATE_LIMIT = {
  /** ウィンドウ期間 (ミリ秒) */
  windowMs: 60 * 1000,

  /** ウィンドウ期間内の最大リクエスト数 */
  maxRequests: 60,

  /** 古いエントリのクリーンアップ間隔 (ミリ秒) */
  cleanupIntervalMs: 5 * 60 * 1000,
} as const;

/** リクエスト記録 */
interface RequestRecord {
  count: number;
  windowStart: number;
}

/** IPアドレスごとのリクエスト記録 */
const requestCounts = new Map<string, RequestRecord>();

/** 定期クリーンアップ */
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < RATE_LIMIT.cleanupIntervalMs) return;

  lastCleanup = now;
  for (const [ip, record] of requestCounts) {
    if (now - record.windowStart > RATE_LIMIT.windowMs) {
      requestCounts.delete(ip);
    }
  }
}

/**
 * クライアントIPアドレスを取得する
 *
 * Vercel/Cloudflare等のリバースプロキシ環境では
 * X-Forwarded-For ヘッダーを参照する。
 */
function getClientIp(event: any): string {
  const forwarded = getRequestHeader(event, "x-forwarded-for");
  if (forwarded) {
    // X-Forwarded-For は "client, proxy1, proxy2" 形式
    return forwarded.split(",")[0].trim();
  }

  return getRequestHeader(event, "x-real-ip")
    || event.node.req.socket?.remoteAddress
    || "unknown";
}

export default defineEventHandler(event => {
  const url = getRequestURL(event);

  // APIエンドポイントのみにレート制限を適用
  if (!url.pathname.startsWith("/api/")) return;

  cleanup();

  const clientIp = getClientIp(event);
  const now = Date.now();
  const record = requestCounts.get(clientIp);

  if (!record || now - record.windowStart > RATE_LIMIT.windowMs) {
    // 新しいウィンドウを開始
    requestCounts.set(clientIp, { count: 1, windowStart: now });
    return;
  }

  record.count++;

  if (record.count > RATE_LIMIT.maxRequests) {
    setResponseHeader(event, "Retry-After", String(Math.ceil((record.windowStart + RATE_LIMIT.windowMs - now) / 1000)));
    throw createError({
      statusCode: 429,
      data: "リクエスト頻度が制限を超えました。しばらく時間をおいてから再試行してください。",
    });
  }
});
