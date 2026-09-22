import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import * as notificationCtrl from "../controllers/notification.controller.js";
import { requireAuth } from "../middlewares/rbac.js";

const router = express.Router();

router.use(requireAuth());

router.get("/", asyncHandler(notificationCtrl.index));
router.get("/unread-count", asyncHandler(notificationCtrl.unreadCount));
router.patch("/:id/read", asyncHandler(notificationCtrl.markRead));
router.patch("/read-all", asyncHandler(notificationCtrl.markAllRead));

export default router;
