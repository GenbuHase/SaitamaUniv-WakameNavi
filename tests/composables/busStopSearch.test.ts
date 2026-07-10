import { describe, expect, it } from "vitest";
import {
  filterStopsByQuery,
  getStopKana,
  getStopRomaji,
  kanaToRomaji,
  normalizeKana,
  normalizeRomajiQuery,
} from "../../app/composables/bus/busStopSearch";

const SAMPLE_STOPS = ["埼玉大学", "北浦和駅西口", "南与野駅西口", "志木駅東口"];

describe("normalizeKana", () => {
  it("converts katakana to hiragana and lowercases", () => {
    expect(normalizeKana("サイタマ")).toBe("さいたま");
    expect(normalizeKana("ABC")).toBe("abc");
  });
});

describe("getStopKana / kanaToRomaji / getStopRomaji", () => {
  it("looks up kana readings from the map", () => {
    expect(getStopKana("埼玉大学")).toBe("さいたまだいがく");
    expect(getStopKana("存在しない停留所")).toBe("");
  });

  it("converts kana to kunrei-shiki romaji with long-vowel normalization", () => {
    expect(kanaToRomaji("さいたまだいがく")).toBe("saitamadaigaku");
    expect(kanaToRomaji("しょうがっこう")).toBe("syogakko");
  });

  it("returns romaji for known stops", () => {
    expect(getStopRomaji("埼玉大学")).toBe("saitamadaigaku");
  });
});

describe("normalizeRomajiQuery", () => {
  it("maps hepburn-style input to kunrei-style", () => {
    expect(normalizeRomajiQuery("Saitama")).toBe("saitama");
    expect(normalizeRomajiQuery("shi")).toBe("si");
    expect(normalizeRomajiQuery("chu")).toBe("tyu");
    expect(normalizeRomajiQuery("ji")).toBe("zi");
  });
});

describe("filterStopsByQuery", () => {
  it("returns all stops when query is empty", () => {
    expect(filterStopsByQuery(SAMPLE_STOPS, "")).toEqual(SAMPLE_STOPS);
  });

  it("matches by kanji substring", () => {
    expect(filterStopsByQuery(SAMPLE_STOPS, "埼玉")).toEqual(["埼玉大学"]);
  });

  it("matches by hiragana / katakana reading", () => {
    expect(filterStopsByQuery(SAMPLE_STOPS, "さいたま")).toEqual(["埼玉大学"]);
    expect(filterStopsByQuery(SAMPLE_STOPS, "サイタマ")).toEqual(["埼玉大学"]);
  });

  it("matches by romaji (hepburn or kunrei)", () => {
    expect(filterStopsByQuery(SAMPLE_STOPS, "saitama")).toEqual(["埼玉大学"]);
    expect(filterStopsByQuery(SAMPLE_STOPS, "kitaurawa")).toEqual(["北浦和駅西口"]);
  });
});
