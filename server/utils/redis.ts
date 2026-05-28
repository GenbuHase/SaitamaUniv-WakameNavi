import { Redis } from "@upstash/redis";

const redisUrl = process.env.KV_REST_API_URL;
const redisToken = process.env.KV_REST_API_TOKEN;

// 接続情報が揃っている場合のみクライアントを初期化
export const hasRedis = !!(redisUrl && redisToken);
export const redis = hasRedis ? new Redis({ url: redisUrl!, token: redisToken! }) : null;