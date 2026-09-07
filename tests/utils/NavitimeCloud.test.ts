import { describe, expect, it } from "vitest";
import {
  parseIsoDuration,
  extractTime,
  normalizeRouteName,
  normalizeDestination,
  extractApproachingsFromHtml,
  parseApproachingItem,
  resolveNuxtPayload
} from "../../shared/utils/Bus/v2/NavitimeCloud";

describe("parseIsoDuration", () => {
  it("parses 0 seconds (PT0S)", () => {
    expect(parseIsoDuration("PT0S")).toBe(0);
  });

  it("parses minutes only (PT5M)", () => {
    expect(parseIsoDuration("PT5M")).toBe(5);
  });

  it("parses minutes and seconds with rounding (PT1M30S)", () => {
    expect(parseIsoDuration("PT1M30S")).toBe(2);
  });

  it("parses seconds only (PT45S)", () => {
    expect(parseIsoDuration("PT45S")).toBe(1);
  });

  it("handles negative durations (-PT2M)", () => {
    expect(parseIsoDuration("-PT2M")).toBe(-2);
  });

  it("returns 0 for empty or invalid input", () => {
    expect(parseIsoDuration("")).toBe(0);
    expect(parseIsoDuration(null)).toBe(0);
    expect(parseIsoDuration(undefined)).toBe(0);
    expect(parseIsoDuration("invalid")).toBe(0);
  });
});

describe("extractTime", () => {
  it("extracts HH:mm from ISO 8601 string", () => {
    expect(extractTime("2026-09-07T09:44:00+09:00")).toBe("09:44");
    expect(extractTime("2026-09-07T18:05:30+09:00")).toBe("18:05");
  });

  it("extracts HH:mm from HH:mm string", () => {
    expect(extractTime("9:05")).toBe("09:05");
    expect(extractTime("14:30")).toBe("14:30");
  });

  it("returns empty string for invalid inputs", () => {
    expect(extractTime("")).toBe("");
    expect(extractTime(null)).toBe("");
    expect(extractTime(undefined)).toBe("");
  });
});

describe("normalizeRouteName", () => {
  it("converts full-width numbers to half-width and removes brackets", () => {
    expect(normalizeRouteName("＜北浦１５＞")).toBe("北浦15");
    expect(normalizeRouteName("北浦０３")).toBe("北浦03");
  });
});

describe("normalizeDestination", () => {
  it("removes leading parentheses prefix like (埼大通り発)", () => {
    expect(normalizeDestination("（埼大通り発）北浦和駅西口")).toBe("北浦和駅西口");
    expect(normalizeDestination("(大久保)加茂川団地")).toBe("加茂川団地");
  });

  it("extracts terminal from range notation with ～", () => {
    expect(normalizeDestination("成増駅～石神井公園駅")).toBe("石神井公園駅");
  });

  it("removes trailing 行", () => {
    expect(normalizeDestination("北浦和駅西口行")).toBe("北浦和駅西口");
  });
});

describe("extractApproachingsFromHtml and parseApproachingItem", () => {
  it("extracts and parses approaching items from Nuxt 3 payload", () => {
    // 擬似的な __NUXT_DATA__ payload
    const mockNuxtData = [
      ["ShallowReactive", 1],
      { data: 2 },
      {
        "bff:/{customer}/busstops/approachings?mock": {
          approachings: [
            {
              courseName: "＜北浦０３＞",
              destination: "（埼大通り発）北浦和駅西口行",
              departure: {
                scheduledArrivalTime: "2026-09-07T10:00:00+09:00",
                predictedArrivalTime: "2026-09-07T10:03:00+09:00",
                delayOfArrival: "PT3M",
                remainingTimeUntilArrival: "PT2M"
              }
            }
          ]
        }
      }
    ];

    const html = `<script type="application/json" data-nuxt-data="nuxt-app" data-ssr="true" id="__NUXT_DATA__">${JSON.stringify(mockNuxtData)}</script>`;
    const approachings = extractApproachingsFromHtml(html);
    expect(approachings).toHaveLength(1);

    const service = parseApproachingItem(approachings[0]!, "KokusaiKogyo", "国際興業バス");
    expect(service).not.toBeNull();
    expect(service?.route).toBe("北浦03");
    expect(service?.destination).toBe("北浦和駅西口");
    expect(service?.scheduledTime).toBe("10:00");
    expect(service?.estimatedTime).toBe("10:03");
    expect(service?.delay).toBe(3);
    expect(service?.location.status).toBe("running");
  });

  it("resolves nested devalue payload using resolveNuxtPayload", () => {
    const rawData = [
      ["ShallowReactive", 1],
      { data: 2 },
      { greeting: 3 },
      "hello world"
    ];
    const resolved = resolveNuxtPayload(rawData) as { greeting: string };
    expect(resolved).not.toBeNull();
    expect(resolved.greeting).toBe("hello world");
  });
});

