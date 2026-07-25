import Report from "../models/report.js";

// ── Write ──────────────────────────────────────────────────────────────────────

export const create = (data) => Report.create(data);

export const updateResolution = (id, updates) =>
  Report.findByIdAndUpdate(id, { $set: updates }, { new: true })
    .populate("reportedBy", "username email firstName lastName")
    .populate("resolvedBy", "username email firstName lastName");

// ── Read ───────────────────────────────────────────────────────────────────────

export const findById = (id) => Report.findById(id);

export const existsForUserAndTarget = (targetType, targetId, reportedBy) =>
  Report.exists({ targetType, targetId, reportedBy });

export const findPaginated = async (
  filter = {},
  { page = 1, limit = 20 } = {},
) => {
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    Report.find(filter)
      .populate("reportedBy", "username email firstName lastName")
      .populate("resolvedBy", "username email firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Report.countDocuments(filter),
  ]);

  return { docs, total, page, limit, totalPages: Math.ceil(total / limit) };
};

// ── Stats ──────────────────────────────────────────────────────────────────────

export const countPending = () => Report.countDocuments({ status: "pending" });
