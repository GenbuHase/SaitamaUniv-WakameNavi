import { describe, expect, it } from "vitest";
import { addMinutes, formatTime, parseTime } from "../../app/composables/bus/busTimeUtils";

describe("parseTime", () => {
  it("parses HH:mm onto the given base date", () => {
    const base = new Date(2026, 6, 10, 0, 0, 0, 0);
    const result = parseTime("08:30", base);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(6);
    expect(result.getDate()).toBe(10);
    expect(result.getHours()).toBe(8);
    expect(result.getMinutes()).toBe(30);
    expect(result.getSeconds()).toBe(0);
  });

  it("supports late-night hours on the same calendar day", () => {
    const base = new Date(2026, 6, 10, 12, 0, 0, 0);
    const result = parseTime("25:10", base);
    // JS Date rolls 25:10 into the next day 01:10
    expect(result.getDate()).toBe(11);
    expect(result.getHours()).toBe(1);
    expect(result.getMinutes()).toBe(10);
  });
});

describe("formatTime", () => {
  it("formats as HH:mm in ja-JP", () => {
    const date = new Date(2026, 6, 10, 9, 5, 0, 0);
    expect(formatTime(date)).toBe("09:05");
  });
});

describe("addMinutes", () => {
  it("adds minutes without mutating the original date", () => {
    const original = new Date(2026, 6, 10, 23, 50, 0, 0);
    const result = addMinutes(original, 20);
    expect(result.getDate()).toBe(11);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(10);
    expect(original.getHours()).toBe(23);
    expect(original.getMinutes()).toBe(50);
  });

  it("supports negative offsets", () => {
    const original = new Date(2026, 6, 10, 8, 0, 0, 0);
    const result = addMinutes(original, -15);
    expect(result.getHours()).toBe(7);
    expect(result.getMinutes()).toBe(45);
  });
});
