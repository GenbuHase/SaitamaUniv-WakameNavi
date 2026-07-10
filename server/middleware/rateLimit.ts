/**
 * レート制限 ミドルウェア
 *
 * APIエンドポイントへのリクエスト頻度を制限する。
 *
 * - 本番 (!import.meta.dev): Redis (Upstash) 必須。未設定または通信失敗時は fail-closed (503)。
 * - 開発 (import.meta.dev): Redis があれば利用し、なければインメモリ Map にフォールバック。
 *   開発時の Redis 通信失敗もインメモリへフォールバックする。
 */
import type { H3Event } from "h3";
import { redis, hasRedis } from "../utils/redis";

/** レート制限設定 */
const RATE_LIMIT = {
  /** ウィンドウ期間 (ミリ秒) */
  windowMs: 60 * 1000,

  /** ウィンドウ期間内の最大リクエスト数 */
  maxRequests: 60,

  /** 古いエントリのクリーンアップ間隔 (ミリ秒) */
  cleanupIntervalMs: 5 * 60 * 1000,
} as const;

/** リクエスト記録 (インメモリフォールバック用・開発環境のみ) */
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
function getClientIp(event: H3Event): string {
  // 1. ローカル開発環境 (localhost) でのテスト対応
  if (import.meta.dev) {
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

function applyInMemoryLimit(clientIp: string, now: number): { currentCount: number; retryAfterSeconds: number } {
  cleanup();
  const record = requestCounts.get(clientIp);

  if (!record || now - record.windowStart > RATE_LIMIT.windowMs) {
    requestCounts.set(clientIp, { count: 1, windowStart: now });
    return {
      currentCount: 1,
      retryAfterSeconds: Math.ceil(RATE_LIMIT.windowMs / 1000),
    };
  }

  record.count++;
  return {
    currentCount: record.count,
    retryAfterSeconds: Math.ceil((record.windowStart + RATE_LIMIT.windowMs - now) / 1000),
  };
}

function rejectUnavailable() {
  throw createError({
    statusCode: 503,
    data: "レート制限サービスが利用できません。しばらく時間をおいてから再試行してください。",
  });
}

export default defineEventHandler(async event => {
  const url = getRequestURL(event);

  // APIエンドポイントのみにレート制限を適用
  if (!url.pathname.startsWith("/api/")) return;

  const isProduction = !import.meta.dev;
  const clientIp = getClientIp(event);
  const now = Date.now();

  // 本番では Redis 必須 (分散環境でのインメモリ制限はバイパス可能)
  if (isProduction && !hasRedis) {
    console.error("[RateLimit] 本番環境で Redis が未設定です。API を拒否します (fail-closed)。");
    rejectUnavailable();
  }

  let currentCount = 0;
  let retryAfterSeconds = 0;

  if (hasRedis && redis) {
    // ----------------------------------------------------
    // Upstash for Redis を使った分散レート制限
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
      console.error("[RateLimit] Upstash Redis 通信エラー:", e);
      if (isProduction) {
        // 本番: 分散制限が効かない状態での継続は危険なため fail-closed
        rejectUnavailable();
      }
      // 開発: インメモリへフォールバック
      console.warn("[RateLimit] 開発環境のためインメモリ制限にフォールバックします。");
      const fallback = applyInMemoryLimit(clientIp, now);
      currentCount = fallback.currentCount;
      retryAfterSeconds = fallback.retryAfterSeconds;
    }
  } else {
    // ----------------------------------------------------
    // 開発環境のみ: インメモリ Map によるフォールバック
    // ----------------------------------------------------
    const fallback = applyInMemoryLimit(clientIp, now);
    currentCount = fallback.currentCount;
    retryAfterSeconds = fallback.retryAfterSeconds;
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
