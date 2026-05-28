/**
 * レート制限 ミドルウェア
 *
 * APIエンドポイントへのリクエスト頻度を制限する。
 * Vercel環境では Vercel KV (Redis) を用い、ローカル環境等の環境変数がない環境では
 * 自動的にインメモリMapへフォールバックする。
 */
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// 接続情報が揃っている場合のみクライアントを初期化
const redis = new Redis({
  url: redisUrl || "",
  token: redisToken || "",
});

/** レート制限設定 */
const RATE_LIMIT = {
  /** ウィンドウ期間 (ミリ秒) */
  windowMs: 60 * 1000,

  /** ウィンドウ期間内の最大リクエスト数 */
  maxRequests: 60,

  /** 古いエントリのクリーンアップ間隔 (ミリ秒) */
  cleanupIntervalMs: 5 * 60 * 1000,
} as const;

/** リクエスト記録 (インメモリフォールバック用) */
interface RequestRecord {
  count: number;
  windowStart: number;
}

/** IPアドレスごとのリクエスト記録 (インメモリフォールバック用) */
const requestCounts = new Map<string, RequestRecord>();

/** 定期クリーンアップ (インメモリフォールバック用) */
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
 * ローカル開発環境 (localhost) での動作テストを保障しつつ、
 * 本番環境 (Vercel) では IP 偽装を防止するためプロキシの公式ヘッダーのみを信頼します。
 */
function getClientIp(event: any): string {
  // 1. ローカル開発環境 (localhost) でのテスト対応
  if (process.dev) {
    const socketIp = event.node.req.socket?.remoteAddress;
    if (socketIp === "::1" || socketIp === "127.0.0.1") {
      return "127.0.0.1";
    }
    return socketIp || "127.0.0.1";
  }

  // 2. 本番環境 (Vercel等) では信頼できるプロキシヘッダーを採用
  // Vercelプロキシは接続元の正しいIPアドレスを x-real-ip に設定します
  const realIp = getRequestHeader(event, "x-real-ip");
  if (realIp) return realIp;

  const forwarded = getRequestHeader(event, "x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return "unknown";
}

export default defineEventHandler(async event => {
  const url = getRequestURL(event);

  // APIエンドポイントのみにレート制限を適用
  if (!url.pathname.startsWith("/api/")) return;

  const clientIp = getClientIp(event);
  const now = Date.now();

  // Upstash for Redis の利用可否を環境変数でチェック
  const hasRedis = !!(redisUrl && redisToken);

  let currentCount = 0;
  let retryAfterSeconds = 0;

  if (hasRedis) {
    // ----------------------------------------------------
    // 1. Upstash for Redis を使った分散レート制限
    // ----------------------------------------------------
    const key = `ratelimit:${clientIp}`;
    try {
      currentCount = await redis.incr(key);
      if (currentCount === 1) {
        await redis.expire(key, Math.ceil(RATE_LIMIT.windowMs / 1000));
      }
      const ttl = await redis.ttl(key);
      retryAfterSeconds = ttl > 0 ? ttl : Math.ceil(RATE_LIMIT.windowMs / 1000);
    } catch (e) {
      // Redisとの通信エラーが発生した場合は、サービス継続のためログ出力の上、インメモリMap制限へ一時的に移行
      console.error("[RateLimit] Upstash Redis 通信エラー。インメモリ制限にフォールバックします:", e);
      fallbackInMemory();
    }
  } else {
    // ----------------------------------------------------
    // 2. インメモリ Map によるローカルフォールバック制限
    // ----------------------------------------------------
    fallbackInMemory();
  }

  function fallbackInMemory() {
    cleanup();
    const record = requestCounts.get(clientIp);

    if (!record || now - record.windowStart > RATE_LIMIT.windowMs) {
      // 新しいウィンドウを開始
      requestCounts.set(clientIp, { count: 1, windowStart: now });
      currentCount = 1;
      retryAfterSeconds = Math.ceil(RATE_LIMIT.windowMs / 1000);
    } else {
      record.count++;
      currentCount = record.count;
      retryAfterSeconds = Math.ceil((record.windowStart + RATE_LIMIT.windowMs - now) / 1000);
    }
  }

  // 閾値チェック
  if (currentCount > RATE_LIMIT.maxRequests) {
    setResponseHeader(event, "Retry-After", String(Math.max(0, retryAfterSeconds)));
    throw createError({
      statusCode: 429,
      data: "リクエスト頻度が制限を超えました。しばらく時間をおいてから再試行してください。",
    });
  }
});
