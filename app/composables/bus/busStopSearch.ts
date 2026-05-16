/**
 * バス停検索ユーティリティ
 *
 * バス停名のよみがなマップ、ローマ字変換、検索フィルタリングを提供する。
 * 漢字・ひらがな・カタカナ・ローマ字のいずれの入力でもバス停を検索可能にする。
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// バス停よみがなマップ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** バス停名 → ひらがな読みのマッピング */
export const STOP_KANA_MAP: Record<string, string> = {
  "北浦和駅西口": "きたうらわえきにしぐち",
  "常磐十丁目": "ときわじゅっちょうめ",
  "大戸小学校": "おおとしょうがっこう",
  "鈴谷小学校": "すずやしょうがっこう",
  "南与野駅北入口": "みなみよのえききたいりぐち",
  "鈴谷札の辻": "すずやふだのつじ",
  "山久保": "やまくぼ",
  "栄和北町": "さかわきたまち",
  "大泉院通り": "だいせんいんどおり",
  "埼玉大学": "さいたまだいがく",
  "南与野駅西口": "みなみよのえきにしぐち",
  "本村": "ほんむら",
  "下大久保": "しもおおくぼ",
  "志木駅東口": "しきえきひがしぐち",
  "東町": "ひがしちょう",
  "双葉町": "ふたばちょう",
  "昭和新道": "しょうわしんどう",
  "上町": "かみちょう",
  "富士道入口": "ふじどういりぐち",
  "市場坂上": "いちばさかうえ",
  "志木市役所": "しきしやくしょ",
  "いろは橋": "いろはばし",
  "中宗岡一丁目": "なかむねおかいっちょうめ",
  "志木高校入口": "しきこうこういりぐち",
  "宿": "しゅく",
  "上宗岡二丁目": "かみむねおかにちょうめ",
  "宗岡蓮田": "むねおかはすだ",
  "北朝霞駅": "きたあさかえき",
  "宮戸橋": "みやとばし",
  "宗岡第三小学校": "むねおかだいさんしょうがっこう",
  "下宗岡一丁目": "しもむねおかいっちょうめ",
  "下宗岡二丁目": "しもむねおかにちょうめ",
  "宗岡": "むねおか",
  "中宗岡": "なかむねおか",
  "中宗岡三丁目": "なかむねおかさんちょうめ",
  "氷川前": "ひかわまえ",
  "五反田": "ごたんだ",
  "上宗岡四丁目": "かみむねおかよんちょうめ",
  "浦和駅西口": "うらわえきにしぐち",
  "県庁通り": "けんちょうどおり",
  "埼玉会館": "さいたまかいかん",
  "県庁前": "けんちょうまえ",
  "附属中学校": "ふぞくちゅうがっこう",
  "別所沼公園": "べっしょぬまこうえん",
  "中浦和駅": "なかうらわえき",
  "関": "せき",
  "田島": "たじま",
  "西堀": "にしぼり",
  "浦和工業高校": "うらわこうぎょうこうこう",
  "土合小学校": "つちあいしょうがっこう",
  "南元宿": "みなみもとじゅく",
  "町屋": "まちや",
  "町屋三丁目": "まちやさんちょうめ",
  "栄和": "さかわ",
  "道場": "どうじょう",
  "十石田": "じゅっこくだ",
  "桜区役所": "さくらくやくしょ",
  "市民会館入口": "しみんかいかんいりぐち",
  "常盤一丁目": "ときわいっちょうめ",
  "常盤二丁目": "ときわにちょうめ",
  "常盤四丁目": "ときわよんちょうめ",
  "六間道路(浦和区)": "ろっけんどうろ",
  "市役所北口(さいたま市)": "しやくしょきたぐち",
  "水道局前": "すいどうきょくまえ",
  "大戸": "おおと",
  "西戸橋": "にしどばし",
  "日向": "ひなた",
  "仲町三丁目(浦和区)": "なかちょうさんちょうめ",
  "市役所前(さいたま市)": "しやくしょまえ",
  "埼大裏": "さいだいうら",
  "諏訪前橋": "すわまえばし",
  "中島": "なかじま",
  "浦和北高校": "うらわきたこうこう",
  "大久保支所": "おおくぼししょ",
  "塚本": "つかもと",
  "やつしまニュータウン": "やつしまにゅーたうん",
  "大久保浄水場": "おおくぼじょうすいじょう",
  "鯛ヶ窪橋": "たいがくぼばし",
  "西堀高沼公園": "にしぼりこうぬまこうえん",
  "西堀氷川トンネル": "にしぼりひかわとんねる",
  "西堀五丁目": "にしぼりごちょうめ",
  "浦和市場入口": "うらわいちばいりぐち",
  "町屋四丁目": "まちやよんちょうめ",
  "道場三丁目": "どうじょうさんちょうめ",
  "北浦和駅": "きたうらわえき"
};

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
      if (KANA_TO_ROMAJI_MAP[twoChar]) {
        romaji += KANA_TO_ROMAJI_MAP[twoChar];
        i++;
        continue;
      }
    }
    const c = kana[i];
    if (c === "っ") {
      if (i < kana.length - 1) {
        const nextTwoChar = kana.substring(i + 1, i + 3);
        const nextChar = kana[i + 1];
        const nextRomaji = KANA_TO_ROMAJI_MAP[nextTwoChar] || KANA_TO_ROMAJI_MAP[nextChar];
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
