import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import * as reportCtrl from "../controllers/report.controller.js";
import validate from "../middlewares/validate.js";
import validateQuery from "../middlewares/validateQuery.js";
import {
  createReportBodySchema,
  resolveReportBodySchema,
} from "../validators/report.schemas.js";
import { adminReportsQuerySchema } from "../validators/admin.schemas.js";
import { requireAuth, requirePermission } from "../middlewares/rbac.js";

const router = express.Router();

// ── Create — any authenticated user can report content ────────────────────────

router.post(
  "/",
  requireAuth(),
  requirePermission("report", "create"),
  validate(createReportBodySchema),
  asyncHandler(reportCtrl.create),
);

// ── Moderation queue — admin only ──────────────────────────────────────────────

router.get(
  "/",
  requireAuth(),
  requirePermission("report", "manageAny"),
  validateQuery(adminReportsQuerySchema),
  asyncHandler(reportCtrl.index),
);

router.patch(
  "/:id/resolve",
  requireAuth(),
  requirePermission("report", "manageAny"),
  validate(resolveReportBodySchema),
  asyncHandler(reportCtrl.resolve),
);

export default router;
