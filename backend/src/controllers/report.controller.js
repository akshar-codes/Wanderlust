import * as reportService from "../services/report.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

// ── POST /api/reports ──────────────────────────────────────────────────────────

export const create = async (req, res) => {
  const report = await reportService.createReport(req.user._id, req.body);
  return sendSuccess(
    res,
    { report, message: "Report submitted. Our team will review it shortly." },
    201,
  );
};

// ── GET /api/reports (admin — moderation queue) ───────────────────────────────

export const index = async (req, res) => {
  const { page = 1, limit = 20, status, targetType } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (targetType) filter.targetType = targetType;

  const result = await reportService.getReports(filter, {
    page: Number(page),
    limit: Math.min(Number(limit), 100),
  });

  return sendSuccess(res, {
    reports: result.docs,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
};

// ── PATCH /api/reports/:id/resolve (admin) ─────────────────────────────────────

export const resolve = async (req, res) => {
  const report = await reportService.resolveReport(
    req.params.id,
    req.body,
    req.user._id,
  );
  return sendSuccess(res, { report, message: `Report ${report.status}` });
};
