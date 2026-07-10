import { describe, expect, it } from "vitest";
import {
  isValidBusStopId,
  isValidCompanyCode,
  isValidKokusaiId,
  isValidSeibuId,
  safeGetString,
} from "../../server/utils/validation";

describe("isValidKokusaiId / isValidSeibuId / isValidBusStopId", () => {
  it("accepts known 8-digit stop IDs for the correct company", () => {
    expect(isValidKokusaiId("00021176")).toBe(true); // 北浦和駅西口
    expect(isValidKokusaiId("00021229")).toBe(true); // 埼玉大学 (国際興業)
    expect(isValidSeibuId("00111643")).toBe(true); // 埼玉大学 (西武)
  });

  it("rejects wrong company, bad format, and unknown IDs", () => {
    expect(isValidKokusaiId("00111643")).toBe(false);
    expect(isValidSeibuId("00021176")).toBe(false);
    expect(isValidBusStopId("123")).toBe(false);
    expect(isValidBusStopId("abcdefgh")).toBe(false);
    expect(isValidBusStopId("99999999")).toBe(false);
  });

  it("isValidBusStopId accepts either company", () => {
    expect(isValidBusStopId("00021176")).toBe(true);
    expect(isValidBusStopId("00111643")).toBe(true);
  });
});

describe("isValidCompanyCode", () => {
  it("accepts only known company codes", () => {
    expect(isValidCompanyCode("KokusaiKogyo")).toBe(true);
    expect(isValidCompanyCode("Seibu")).toBe(true);
    expect(isValidCompanyCode("Kokusai")).toBe(false);
    expect(isValidCompanyCode("")).toBe(false);
  });
});

describe("safeGetString", () => {
  it("returns non-empty strings within length limit", () => {
    expect(safeGetString("hello")).toBe("hello");
    expect(safeGetString("a".repeat(100))).toBe("a".repeat(100));
  });

  it("rejects empty, oversized, and non-string values", () => {
    expect(safeGetString("")).toBeUndefined();
    expect(safeGetString("a".repeat(101))).toBeUndefined();
    expect(safeGetString(undefined)).toBeUndefined();
    expect(safeGetString(null)).toBeUndefined();
    expect(safeGetString(42)).toBeUndefined();
    expect(safeGetString(["a"])).toBeUndefined();
    expect(safeGetString({ a: "b" })).toBeUndefined();
  });
});
