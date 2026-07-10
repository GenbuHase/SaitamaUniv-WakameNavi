import { defineConfig } from "vitest/config";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Windows では cwd のドライブレター大小文字不一致で suite コンテキストが
// undefined になり describe が落ちることがあるため、root を正規化する。
// @see https://github.com/vitest-dev/vitest/issues/5251
const rootDir = fileURLToPath(new URL(".", import.meta.url));

/**
 * Vitest 4 + このリポジトリの Nuxt/Vite セットアップ向け設定。
 *
 * - environment: node（サーバー／純粋ユーティリティの単体テスト）
 * - globals: false（各テストで vitest から明示 import）
 * - エイリアスは Nuxt の @@ / @ / ~ / ~~ に合わせる
 */
export default defineConfig({
  root: rootDir,
  test: {
    environment: "node",
    include: ["tests/**/*.{test,spec}.ts"],
    globals: false,
    // root と同様、パス解決の一貫性のため明示
    dir: rootDir,
  },
  resolve: {
    alias: {
      "@@": resolve(rootDir, "."),
      "@": resolve(rootDir, "app"),
      "~": resolve(rootDir, "app"),
      "~~": resolve(rootDir, "."),
    },
  },
});
