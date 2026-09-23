import { describe, it, expect } from "vitest";
import { resolveDateRange, pctChange } from "../../../src/utils/dateUtils.js";

describe("Date Utils", () => {
  describe("resolveDateRange", () => {
    it("resolves 7d range correctly", () => {
      const { days, groupBy } = resolveDateRange("7d");
      expect(days).toBe(7);
      expect(groupBy).toBe("day");
    });

    it("resolves 30d range (default)", () => {
      const { days, groupBy } = resolveDateRange("30d");
      expect(days).toBe(30);
      expect(groupBy).toBe("day");
    });

    it("resolves 90d range", () => {
      const { days, groupBy } = resolveDateRange("90d");
      expect(days).toBe(90);
      expect(groupBy).toBe("week");
    });

    it("resolves 12m range", () => {
      const { days, groupBy } = resolveDateRange("12m");
      expect(days).toBe(365);
      expect(groupBy).toBe("month");
    });

    it("calculates correct start/end intervals", () => {
      const { startDate, endDate, prevStartDate, prevEndDate, days } =
        resolveDateRange("7d");
      const msPerDay = 24 * 60 * 60 * 1000;

      const diffCurrent = Math.round(
        (endDate.getTime() - startDate.getTime()) / msPerDay,
      );
      expect(diffCurrent).toBe(7);

      const diffPrev = Math.round(
        (prevEndDate.getTime() - prevStartDate.getTime()) / msPerDay,
      );
      expect(diffPrev).toBe(7);

      expect(startDate.getTime()).toBe(prevEndDate.getTime());
    });
  });

  describe("pctChange", () => {
    it("handles zero previous gracefully", () => {
      expect(pctChange(100, 0)).toBe(100);
      expect(pctChange(0, 0)).toBe(0);
    });

    it("calculates accurate percentages rounded to 1 decimal", () => {
      expect(pctChange(150, 100)).toBe(50);
      expect(pctChange(50, 100)).toBe(-50);
      expect(pctChange(112, 100)).toBe(12);
      expect(pctChange(133.33, 100)).toBe(33.3);
    });
  });
});
