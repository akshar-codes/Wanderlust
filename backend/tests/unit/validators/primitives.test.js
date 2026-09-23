import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  nonEmptyString,
  coercePositiveInt,
  coerceNonNegativeNumber,
  numericQueryParam,
  commaSeparatedArray,
  flattenZodErrors,
} from "../../../src/validators/primitives.js";

describe("Validation Primitives", () => {
  describe("nonEmptyString", () => {
    const schema = nonEmptyString("Field");

    it("accepts valid string", () => {
      expect(schema.parse("hello")).toBe("hello");
      expect(schema.parse("  hello  ")).toBe("hello");
    });

    it("rejects empty or whitespace string", () => {
      expect(schema.safeParse("").success).toBe(false);
      expect(schema.safeParse("   ").success).toBe(false);
    });

    it("rejects missing values", () => {
      expect(schema.safeParse(undefined).success).toBe(false);
    });
  });

  describe("coercePositiveInt", () => {
    const schema = coercePositiveInt("Field", 1);

    it("coerces string numbers to integers", () => {
      expect(schema.parse("5")).toBe(5);
      expect(schema.parse(5)).toBe(5);
    });

    it("rejects numbers below minimum", () => {
      expect(schema.safeParse("0").success).toBe(false);
      expect(schema.safeParse(0).success).toBe(false);
    });

    it("rejects non-integer numbers", () => {
      expect(schema.safeParse("5.5").success).toBe(false);
      expect(schema.safeParse(5.5).success).toBe(false);
    });

    it("rejects invalid strings", () => {
      expect(schema.safeParse("abc").success).toBe(false);
    });

    it("handles missing/empty values correctly", () => {
      expect(schema.safeParse("").success).toBe(false);
      expect(schema.safeParse(undefined).success).toBe(false);
    });
  });

  describe("coerceNonNegativeNumber", () => {
    const schema = coerceNonNegativeNumber("Field");

    it("coerces valid numbers and floats", () => {
      expect(schema.parse("5")).toBe(5);
      expect(schema.parse("5.5")).toBe(5.5);
      expect(schema.parse(0)).toBe(0);
    });

    it("rejects negative numbers", () => {
      expect(schema.safeParse("-1").success).toBe(false);
      expect(schema.safeParse(-0.1).success).toBe(false);
    });
  });

  describe("numericQueryParam", () => {
    const schema = numericQueryParam("Field", { min: 10, max: 20 });

    it("coerces and validates within range", () => {
      expect(schema.parse("15")).toBe(15);
      expect(schema.parse(10)).toBe(10);
      expect(schema.parse("20")).toBe(20);
    });

    it("allows undefined/empty since it's optional", () => {
      expect(schema.parse("")).toBeUndefined();
      expect(schema.parse(undefined)).toBeUndefined();
    });

    it("rejects out of bounds", () => {
      expect(schema.safeParse("9").success).toBe(false);
      expect(schema.safeParse("21").success).toBe(false);
    });

    it("rejects invalid numbers", () => {
      expect(schema.safeParse("abc").success).toBe(false);
    });
  });

  describe("commaSeparatedArray", () => {
    it("splits comma separated strings", () => {
      expect(commaSeparatedArray.parse("a,b,c")).toEqual(["a", "b", "c"]);
      expect(commaSeparatedArray.parse("a, b , c")).toEqual(["a", "b", "c"]);
    });

    it("filters out empty values", () => {
      expect(commaSeparatedArray.parse("a,,b,")).toEqual(["a", "b"]);
    });

    it("handles undefined", () => {
      expect(commaSeparatedArray.parse(undefined)).toBeUndefined();
    });
  });

  describe("flattenZodErrors", () => {
    it("formats zod errors properly", () => {
      const objSchema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const result = objSchema.safeParse({ name: 123 });
      if (!result.success) {
        const flat = flattenZodErrors(result.error);
        expect(flat.length).toBe(2);
        expect(flat[0].field).toBe("name");
        expect(flat[1].field).toBe("age");
      } else {
        expect.fail("Should have failed validation");
      }
    });
  });
});
