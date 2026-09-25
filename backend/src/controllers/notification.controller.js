import * as notificationService from "../services/notification.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import AppError from "../utils/AppError.js";

export const index = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const result = await notificationService.getNotifications(req.user._id, {
    page: Number(page),
    limit: Math.min(Number(limit), 50),
  });

  return sendSuccess(res, {
    notifications: result.docs,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
};

export const unreadCount = async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);
  return sendSuccess(res, { count });
};

export const markRead = async (req, res) => {
  const notification = await notificationService.markRead(
    req.params.id,
    req.user._id,
  );
  if (!notification) {
    throw AppError.notFound("Notification not found");
  }
  return sendSuccess(res, { notification });
};

export const markAllRead = async (req, res) => {
  const result = await notificationService.markAllRead(req.user._id);
  return sendSuccess(res, { modifiedCount: result.modifiedCount });
};
