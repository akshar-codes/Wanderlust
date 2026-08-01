import * as reportRepo from "../repositories/report.repository.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";

export const createReport = async (userId, payload) => {
  const exists = await reportRepo.existsForUserAndTarget(
    payload.targetType,
    payload.targetId,
    userId
  );
  if (exists) {
    throw AppError.conflict("You have already reported this item");
  }

  const report = await reportRepo.create({
    ...payload,
    reportedBy: userId,
  });

  logger.info("New report submitted", {
    reportId: report._id,
    targetType: report.targetType,
    targetId: report.targetId,
  });

  return report;
};

export const getReports = async (filter, options) => {
  return reportRepo.findPaginated(filter, options);
};

export const resolveReport = async (id, payload, adminId) => {
  const report = await reportRepo.findById(id);
  if (!report) {
    throw AppError.notFound("Report not found");
  }

  if (report.status !== "pending") {
    throw AppError.badRequest(`Report is already ${report.status}`);
  }

  const updated = await reportRepo.updateResolution(id, {
    status: payload.status,
    resolutionNotes: payload.resolutionNotes,
    resolvedBy: adminId,
    resolvedAt: new Date(),
  });

  logger.info("Report resolved", {
    reportId: id,
    status: payload.status,
    adminId,
  });

  return updated;
};
