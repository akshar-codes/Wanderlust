import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import * as reviewCtrl from "../controllers/review.controller.js";
import validate from "../middlewares/validate.js";
import upload from "../middlewares/upload.js";
import { reviewBodySchema } from "../validators/index.js";
import * as reviewRepo from "../repositories/review.repository.js";
import {
  requireAuth,
  requirePermission,
  requireOwnerOrAdmin,
} from "../middlewares/rbac.js";

const router = express.Router({ mergeParams: true });

const fetchReview = (req) => reviewRepo.findById(req.params.reviewId);

// ── Collection ────────────────────────────────────────────────────────────────
router
  .route("/")
  .get(asyncHandler(reviewCtrl.index))
  .post(
    requireAuth(),
    requirePermission("review", "create"),
    validate(reviewBodySchema),
    asyncHandler(reviewCtrl.create),
  );

// ── Statistics ────────────────────────────────────────────────────────────────
router.get("/stats", asyncHandler(reviewCtrl.stats));

// ── Single review ─────────────────────────────────────────────────────────────
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

// ── Host reply ─────────────────────────────────────────────────────────────────
router
  .route("/:reviewId/reply")
  .post(requireAuth(), asyncHandler(reviewCtrl.upsertReply))
  .put(requireAuth(), asyncHandler(reviewCtrl.upsertReply))
  .delete(requireAuth(), asyncHandler(reviewCtrl.deleteReply));

// ── Helpful vote ──────────────────────────────────────────────────────────────
router.post(
  "/:reviewId/helpful",
  requireAuth(),
  asyncHandler(reviewCtrl.toggleHelpful),
);

// ── Photos ────────────────────────────────────────────────────────────────────
router.post(
  "/:reviewId/photos",
  requireAuth(),
  upload.array("photos", 5),
  asyncHandler(reviewCtrl.addPhotos),
);

router.delete(
  "/:reviewId/photos/:photoId",
  requireAuth(),
  asyncHandler(reviewCtrl.deletePhoto),
);

export default router;
