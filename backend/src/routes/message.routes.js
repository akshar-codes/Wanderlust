import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import validate from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/rbac.js";
import { createMessageBodySchema } from "../validators/message.schemas.js";
import * as messageController from "../controllers/message.controller.js";

const router = express.Router();
router.use(requireAuth());
router.get("/", asyncHandler(messageController.index));
router.get("/events", asyncHandler(messageController.stream));
router.get("/:bookingId", asyncHandler(messageController.show));
router.post(
  "/:bookingId",
  validate(createMessageBodySchema),
  asyncHandler(messageController.create),
);

export default router;
