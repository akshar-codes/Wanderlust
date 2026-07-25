import { z } from "zod";
import { numericQueryParam } from "./primitives.js";
import { USER_ROLES, LISTING_CATEGORIES, LISTING_STATUSES } from "./enums.js";
import { REPORT_TARGET_TYPES, REPORT_STATUSES } from "../models/report.js";

// ── Users ──────────────────────────────────────────────────────────────────────

export const adminUsersQuerySchema = z.object({
  page: numericQueryParam("page", { min: 1 }),
  limit: numericQueryParam("limit", { min: 1, max: 100 }),
  search: z.string().trim().max(100).optional(),
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(["active", "suspended"]).optional(),
});

export const updateUserStatusBodySchema = z.object({
  isActive: z.boolean({ required_error: "isActive is required" }),
  reason: z.string().trim().max(500).optional().nullable(),
});

// ── Listings ───────────────────────────────────────────────────────────────────

export const adminListingsQuerySchema = z.object({
  page: numericQueryParam("page", { min: 1 }),
  limit: numericQueryParam("limit", { min: 1, max: 100 }),
  search: z.string().trim().max(100).optional(),
  status: z.enum(LISTING_STATUSES).optional(),
  category: z.enum(LISTING_CATEGORIES).optional(),
  featured: z
    .enum(["true", "false"])
    .optional()
    .transform((v) =>
      v === "true" ? true : v === "false" ? false : undefined,
    ),
});

export const updateListingStatusBodySchema = z.object({
  status: z.enum(LISTING_STATUSES, {
    required_error: "status is required",
    message: `status must be one of: ${LISTING_STATUSES.join(", ")}`,
  }),
  reason: z.string().trim().max(500).optional().nullable(),
});

// ── Reviews ────────────────────────────────────────────────────────────────────

export const adminReviewsQuerySchema = z.object({
  page: numericQueryParam("page", { min: 1 }),
  limit: numericQueryParam("limit", { min: 1, max: 100 }),
  rating: numericQueryParam("rating", { min: 1, max: 5 }),
  search: z.string().trim().max(200).optional(),
});

// ── Analytics ──────────────────────────────────────────────────────────────────

export const ADMIN_ANALYTICS_RANGE_VALUES = ["7d", "30d", "90d", "12m"];

export const adminAnalyticsQuerySchema = z.object({
  range: z.enum(ADMIN_ANALYTICS_RANGE_VALUES).optional().default("30d"),
});

// ── Reports (moderation queue) ──────────────────────────────────────────────────

export const adminReportsQuerySchema = z.object({
  page: numericQueryParam("page", { min: 1 }),
  limit: numericQueryParam("limit", { min: 1, max: 100 }),
  status: z.enum(REPORT_STATUSES).optional(),
  targetType: z.enum(REPORT_TARGET_TYPES).optional(),
});
