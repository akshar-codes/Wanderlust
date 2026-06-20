"use strict";

const { z } = require("zod");

// ── Primitive builders ────────────────────────────────────────────────────────

const nonEmptyString = (label) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(1, `${label} cannot be empty`);

const coercePositiveInt = (label, min = 0) =>
  z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
    z
      .number({ required_error: `${label} is required` })
      .int(`${label} must be a whole number`)
      .min(min, `${label} must be at least ${min}`),
  );

const coerceNonNegativeNumber = (label) =>
  z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
    z.number().min(0, `${label} must be 0 or greater`),
  );

const numericQueryParam = (label, { min, max } = {}) =>
  z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : Number(v)),
    z
      .number({ invalid_type_error: `${label} must be a number` })
      .optional()
      .refine(
        (v) => v === undefined || !isNaN(v),
        `${label} must be a valid number`,
      )
      .refine(
        (v) => min === undefined || v === undefined || v >= min,
        `${label} must be ≥ ${min}`,
      )
      .refine(
        (v) => max === undefined || v === undefined || v <= max,
        `${label} must be ≤ ${max}`,
      ),
  );

const commaSeparatedArray = z
  .string()
  .optional()
  .transform((v) =>
    v === undefined
      ? undefined
      : v
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
  );

// ── Zod error flattener ───────────────────────────────────────────────────────

const flattenZodErrors = (zodError) =>
  (zodError.issues ?? zodError.errors ?? []).map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));

module.exports = {
  nonEmptyString,
  coercePositiveInt,
  coerceNonNegativeNumber,
  numericQueryParam,
  commaSeparatedArray,
  flattenZodErrors,
};
