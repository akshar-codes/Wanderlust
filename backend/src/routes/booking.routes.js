import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import * as bookingCtrl from "../controllers/booking.controller.js";
import validate from "../middlewares/validate.js";
import {
  createBookingBodySchema,
  cancelBookingBodySchema,
} from "../validators/index.js";
import { requireAuth } from "../middlewares/rbac.js";
import { createLimiter } from "../config/rateLimiter.config.js";

const router = express.Router();

router.get("/", requireAuth(), asyncHandler(bookingCtrl.index));
router.get("/host", requireAuth(), asyncHandler(bookingCtrl.hostIndex));

router.post(
  "/",
  requireAuth(),
  createLimiter,
  validate(createBookingBodySchema),
  asyncHandler(bookingCtrl.create),
);

router.patch(
  "/:id/cancel",
  requireAuth(),
  validate(cancelBookingBodySchema),
  asyncHandler(bookingCtrl.cancel),
);

export default router;
