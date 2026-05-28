import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// 接続情報が揃っている場合のみクライアントを初期化
export const hasRedis = !!(redisUrl && redisToken);

export const redis = hasRedis
  ? Redis.fromEnv()
  : null;