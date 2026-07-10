/**
 * バス停検索ユーティリティ
 *
 * よみがなマップは shared/utils/Bus/v2/StopKana.ts（Routes.ts と対になる補助データ）。
 * 停留所の正本は Routes.ts の ALL_ROUTES。
 */

import { STOP_KANA_MAP } from "@@/shared/utils/Bus/v2/StopKana";

export { STOP_KANA_MAP };

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ひらがな → ローマ字変換マップ (訓令式ベース)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const KANA_TO_ROMAJI_MAP: Record<string, string> = {
  あ: "a", い: "i", う: "u", え: "e", お: "o",
  か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko",
  さ: "sa", し: "si", す: "su", せ: "se", そ: "so",
  た: "ta", ち: "ti", つ: "tu", て: "te", と: "to",
  な: "na", に: "ni", ぬ: "nu", ね: "ne", の: "no",
  は: "ha", ひ: "hi", ふ: "hu", へ: "he", ほ: "ho",
  ま: "ma", み: "mi", む: "mu", め: "me", も: "mo",
  や: "ya", ゆ: "yu", よ: "yo",
  ら: "ra", り: "ri", る: "ru", れ: "re", ろ: "ro",
  わ: "wa", を: "o", ん: "n",
  が: "ga", ぎ: "gi", ぐ: "gu", げ: "ge", ご: "go",
  ざ: "za", じ: "zi", ず: "zu", ぜ: "ze", ぞ: "zo",
  だ: "da", ぢ: "zi", づ: "zu", で: "de", ど: "do",
  ば: "ba", び: "bi", ぶ: "bu", べ: "be", ぼ: "bo",
  ぱ: "pa", ぴ: "pi", ぷ: "pu", ぺ: "pe", ぽ: "po",
  きゃ: "kya", きゅ: "kyu", きょ: "kyo",
  しゃ: "sya", しゅ: "syu", しょ: "syo",
  ちゃ: "tya", ちゅ: "tyu", ちょ: "tyo",
  にゃ: "nya", にゅ: "nyu", にょ: "nyo",
  ひゃ: "hya", ひゅ: "hyu", ひょ: "hyo",
  みゃ: "mya", みゅ: "myu", みょ: "myo",
  りゃ: "rya", りゅ: "ryu", りょ: "ryo",
  ぎゃ: "gya", ぎゅ: "gyu", ぎょ: "gyo",
  じゃ: "zya", じゅ: "zyu", じょ: "zyo",
  びゃ: "bya", びゅ: "byu", びょ: "byo",
  ぴゃ: "pya", ぴゅ: "pyu", ぴょ: "pyo",
  っ: "t", ー: "-"
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 変換・正規化関数
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** カタカナをひらがなに変換し、大文字小文字を統一する */
export function normalizeKana(str: string): string {
  return str.replace(/[\u30a1-\u30f6]/g, match => String.fromCharCode(match.charCodeAt(0) - 0x60)).toLowerCase();
}

/** バス停名からひらがな読みを取得する */
export function getStopKana(stopName: string): string {
  return STOP_KANA_MAP[stopName] || "";
}

/** ひらがなを正規化されたローマ字に変換する */
export function kanaToRomaji(kana: string): string {
  let romaji = "";
  for (let i = 0; i < kana.length; i++) {
    if (i < kana.length - 1) {
      const twoChar = kana.substring(i, i + 2);
      const twoMapped = KANA_TO_ROMAJI_MAP[twoChar];
      if (twoMapped) {
        romaji += twoMapped;
        i++;
        continue;
      }
    }
    const c = kana[i];
    if (c === undefined) continue;
    if (c === "っ") {
      if (i < kana.length - 1) {
        const nextTwoChar = kana.substring(i + 1, i + 3);
        const nextChar = kana[i + 1];
        const nextRomaji = KANA_TO_ROMAJI_MAP[nextTwoChar]
          ?? (nextChar !== undefined ? KANA_TO_ROMAJI_MAP[nextChar] : undefined);
        if (nextRomaji) {
          romaji += nextRomaji[0]; // 子音を重ねる
        } else {
          romaji += "t";
        }
      }
      continue;
    }
    romaji += KANA_TO_ROMAJI_MAP[c] || c;
  }
  // 長音の揺れを吸収 (ou -> o, uu -> u, oo -> o)
  return romaji.replace(/ou/g, "o").replace(/uu/g, "u").replace(/oo/g, "o");
}

/** バス停名のローマ字表現を取得する */
export function getStopRomaji(stopName: string): string {
  return kanaToRomaji(getStopKana(stopName));
}

/** ユーザー入力のローマ字を正規化する (ヘボン式 → 訓令式、長音吸収) */
export function normalizeRomajiQuery(query: string): string {
  return query.toLowerCase()
    .replace(/shi/g, "si").replace(/chi/g, "ti").replace(/tsu/g, "tu")
    .replace(/fu/g, "hu").replace(/ji/g, "zi")
    .replace(/sha/g, "sya").replace(/shu/g, "syu").replace(/sho/g, "syo")
    .replace(/cha/g, "tya").replace(/chu/g, "tyu").replace(/cho/g, "tyo")
    .replace(/ja/g, "zya").replace(/ju/g, "zyu").replace(/jo/g, "zyo")
    .replace(/ou/g, "o").replace(/uu/g, "u").replace(/oo/g, "o")
    .replace(/tch/g, "tt");
}

/**
 * バス停名リストを検索クエリでフィルタリングする
 *
 * 漢字・ひらがな・カタカナ・ローマ字のいずれの入力でもマッチする。
 *
 * @param stops - フィルタ対象のバス停名リスト
 * @param query - 検索クエリ文字列
 * @returns フィルタ後のバス停名リスト
 */
export function filterStopsByQuery(stops: string[], query: string): string[] {
  if (!query) return stops;

  const searchWord = normalizeKana(query);
  const searchRomaji = normalizeRomajiQuery(query);

  return stops.filter(stop =>
    normalizeKana(stop).includes(searchWord)
    || getStopKana(stop).includes(searchWord)
    || (searchRomaji.length > 0 && getStopRomaji(stop).includes(searchRomaji))
  );
}
