/**
 * セキュリティヘッダー ミドルウェア
 *
 * すべてのレスポンスにセキュリティヘッダーを付与する。
 * 開発環境 (process.dev) と本番環境で CSP (Content Security Policy) を動的に切り替え、
 * 本番環境での XSS に対する防御力を極限まで高める。
 */
export default defineEventHandler(event => {
  const isDev = process.dev;

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
    // 本番環境 (Vercel) では 'unsafe-eval' を完全に排除し、インラインスクリプトのみを必要に応じて許可
    scriptSrc.push("'unsafe-inline'");
  }

  // 2. スタイルの読み込み許可元 (Tailwind CSS の動的スタイルインジェクション用に 'unsafe-inline' を許可)
  const styleSrc = [
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
    "https://cdn.jsdelivr.net",
  ];

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
      "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
      "img-src 'self' data: https:",
      "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com",
    ].join("; "),
  });
});
