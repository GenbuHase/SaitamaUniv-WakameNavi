/**
 * セキュリティヘッダー ミドルウェア
 *
 * すべてのレスポンスにセキュリティヘッダーを付与する。
 * - X-Frame-Options: クリックジャッキング防止
 * - X-Content-Type-Options: MIMEスニッフィング防止
 * - Referrer-Policy: リファラー情報の制御
 * - Permissions-Policy: ブラウザ機能へのアクセス制御
 * - Content-Security-Policy: コンテンツの読み込み元を制限
 */
export default defineEventHandler(event => {
  setResponseHeaders(event, {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "0",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
      "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
      "img-src 'self' data: https:",
      "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com",
    ].join("; "),
  });
});
