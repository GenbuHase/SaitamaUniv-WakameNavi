import { describe, expect, it } from "vitest";
import Bus from "../../shared/utils/Bus/v2/index";

describe("Bus Services Integration (Live external communication)", () => {
  it("fetches Kokusai Kogyo bus services between 埼玉大学 and 北浦和駅西口", async () => {
    const services = await Bus.KokusaiKogyoBus.getServices("00021229", "00021176");
    console.log("Kokusai services count:", services.length);
    expect(Array.isArray(services)).toBe(true);
    if (services.length > 0) {
      const first = services[0]!;
      expect(first.companyCode).toBe("KokusaiKogyo");
      expect(first.route).toBeTruthy();
      expect(first.destination).toBeTruthy();
      expect(first.scheduledTime).toMatch(/^\d{2}:\d{2}$/);
      expect(first.location).toBeDefined();
    }
  }, 30_000);

  it("fetches Kokusai Kogyo bus services with no arrival specified (埼玉大学)", async () => {
    const services = await Bus.KokusaiKogyoBus.getServices("00021229", "00021229");
    console.log("Kokusai (no goal) services count:", services.length);
    expect(Array.isArray(services)).toBe(true);
    if (services.length > 0) {
      const first = services[0]!;
      expect(first.companyCode).toBe("KokusaiKogyo");
      expect(first.scheduledTime).toMatch(/^\d{2}:\d{2}$/);
    }
  }, 30_000);

  it("fetches Seibu bus services between 北浦和駅 and 加茂川団地", async () => {
    const services = await Bus.SeibuBus.getServices("00111628", "00111599");
    console.log("Seibu services count:", services.length);
    expect(Array.isArray(services)).toBe(true);
    if (services.length > 0) {
      const first = services[0]!;
      expect(first.companyCode).toBe("Seibu");
      expect(first.route).toBeTruthy();
      expect(first.destination).toBeTruthy();
      expect(first.scheduledTime).toMatch(/^\d{2}:\d{2}$/);
      expect(first.location).toBeDefined();
    }
  }, 30_000);

  it("fetches Seibu bus services with no arrival specified (北浦和駅)", async () => {
    const services = await Bus.SeibuBus.getServices("00111628", "00111628");
    console.log("Seibu (no goal) services count:", services.length);
    expect(Array.isArray(services)).toBe(true);
    if (services.length > 0) {
      const first = services[0]!;
      expect(first.companyCode).toBe("Seibu");
      expect(first.scheduledTime).toMatch(/^\d{2}:\d{2}$/);
    }
  }, 30_000);
});
