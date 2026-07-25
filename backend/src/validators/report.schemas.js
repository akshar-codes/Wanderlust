import { z } from "zod";
import { nonEmptyString } from "./primitives.js";
import {
  REPORT_TARGET_TYPES,
  REPORT_REASONS,
  REPORT_RESOLUTION_ACTIONS,
} from "../models/report.js";

export const createReportBodySchema = z.object({
  targetType: z.enum(REPORT_TARGET_TYPES, {
    required_error: "targetType is required",
    message: `targetType must be one of: ${REPORT_TARGET_TYPES.join(", ")}`,
  }),
  targetId: nonEmptyString("targetId"),
  reason: z.enum(REPORT_REASONS, {
    required_error: "reason is required",
    message: `reason must be one of: ${REPORT_REASONS.join(", ")}`,
  }),
  description: z.string().trim().max(1000).optional().nullable(),
});

export const resolveReportBodySchema = z.object({
  status: z.enum(["resolved", "dismissed"], {
    required_error: "status is required",
    message: "status must be either resolved or dismissed",
  }),
  resolutionAction: z
    .enum(REPORT_RESOLUTION_ACTIONS)
    .optional()
    .default("none"),
  resolutionNote: z.string().trim().max(1000).optional().nullable(),
});
