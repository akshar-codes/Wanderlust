import Notification from "../models/notification.js";

export const findPaginated = async (recipientId, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    Notification.find({ recipient: recipientId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ recipient: recipientId }),
  ]);

  return {
    docs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const countUnread = (recipientId) => {
  return Notification.countDocuments({ recipient: recipientId, read: false });
};

export const markRead = (notificationId, recipientId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipient: recipientId },
    { $set: { read: true, readAt: new Date() } },
    { new: true },
  );
};

export const markAllRead = (recipientId) => {
  return Notification.updateMany(
    { recipient: recipientId, read: false },
    { $set: { read: true, readAt: new Date() } },
  );
};

export const create = (data) => {
  return Notification.create(data);
};
