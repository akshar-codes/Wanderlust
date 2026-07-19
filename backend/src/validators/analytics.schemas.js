import { z } from "zod";

export const ANALYTICS_RANGE_VALUES = ["7d", "30d", "90d", "12m"];

export const analyticsQuerySchema = z.object({
  range: z.enum(ANALYTICS_RANGE_VALUES).optional().default("30d"),
  listingId: z.string().trim().min(1).optional(),
});
