import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import * as reviewCtrl from "../controllers/review.controller.js";
import validate from "../middlewares/validate.js";
import { reviewBodySchema } from "../validators/index.js";
import * as reviewRepo from "../repositories/review.repository.js";
import {
  requireAuth,
  requirePermission,
  requireOwnerOrAdmin,
} from "../middlewares/rbac.js";

const router = express.Router({ mergeParams: true });

const fetchReview = (req) => reviewRepo.findById(req.params.reviewId);

router
  .route("/")
  .get(asyncHandler(reviewCtrl.index))
  .post(
    requireAuth(),
    requirePermission("review", "create"),
    validate(reviewBodySchema),
    asyncHandler(reviewCtrl.create),
  );

router
  .route("/:reviewId")
  .get(asyncHandler(reviewCtrl.show))
  .patch(
    requireAuth(),
    requirePermission("review", "update"),
    requireOwnerOrAdmin(fetchReview, "author", "Review"),
    validate(reviewBodySchema),
    asyncHandler(reviewCtrl.update),
  )
  .delete(
    requireAuth(),
    requirePermission("review", "delete"),
    requireOwnerOrAdmin(fetchReview, "author", "Review"),
    asyncHandler(reviewCtrl.destroy),
  );

export default router;
