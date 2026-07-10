/**
 * セキュリティヘッダー ミドルウェア
 *
 * すべてのレスポンスにセキュリティヘッダーを付与する。
 * 開発環境 (import.meta.dev) と本番環境で CSP (Content Security Policy) を動的に切り替え、
 * 本番環境での XSS に対する防御力を高める。
 *
 * CSP 方針 (2026-07):
 * - style-src: Tailwind / Vue のランタイムスタイル注入のため 'unsafe-inline' を維持
 * - script-src: Nuxt SPA + nuxt-gtag がインラインスクリプトを注入するため、
 *   現状は本番でも 'unsafe-inline' が必要（nonce/hash 化はビルドパイプライン改修が必要）
 * - 未使用の cdn.jsdelivr.net を除去し、img-src / connect-src を必要最小限に絞る
 */
export default defineEventHandler(event => {
  const isDev = import.meta.dev;

  // 1. スクリプトの読み込み許可元
  const scriptSrc = [
    "'self'",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
  ];

  // 開発環境と本番環境で動的に切り替える
  if (isDev) {
    // 開発環境 (npm run dev / localhost) では Vite の HMR やデバッガーのために許可を緩和
    scriptSrc.push("'unsafe-inline'", "'unsafe-eval'");
  } else {
    // 本番: Nuxt SPA のインラインブートストラップ + gtag 注入のため 'unsafe-inline' は残す。
    // 'unsafe-eval' は排除済み。nonce 化は別途 Nuxt hook でのヘッダー連携が必要。
    scriptSrc.push("'unsafe-inline'");
  }

  // 2. スタイルの読み込み許可元 (Tailwind / Vue の動的スタイル用に 'unsafe-inline' を許可)
  const styleSrc = [
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
  ];

  // 3. 接続先 (自 API + GA 系のみ。スクレイピング先はサーバー側のみでブラウザからは不要)
  const connectSrc = [
    "'self'",
    "https://www.google-analytics.com",
    "https://region1.google-analytics.com",
    "https://analytics.google.com",
    "https://www.googletagmanager.com",
  ];

  if (isDev) {
    // Vite HMR / 開発サーバー用 WebSocket
    connectSrc.push("ws:", "wss:");
  }

  setResponseHeaders(event, {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "0",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy": [
      "default-src 'self'",
      `script-src ${scriptSrc.join(" ")}`,
      `style-src ${styleSrc.join(" ")}`,
      "font-src 'self' https://fonts.gstatic.com",
      // OGP・favicon・data URI アイコン。任意 https: は許可しない
      "img-src 'self' data: https://wakame-navi.vercel.app https://www.google-analytics.com https://www.googletagmanager.com",
      `connect-src ${connectSrc.join(" ")}`,
      // Service Worker (PWA) — 同一オリジンのみ
      "worker-src 'self' blob:",
      "child-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
    ].join("; "),
  });
});
