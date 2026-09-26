import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import * as reviewCtrl from "../controllers/review.controller.js";
import validate from "../middlewares/validate.js";
import { listingImageUpload, validateFileType } from "../middlewares/upload.js";
import { reviewBodySchema } from "../validators/index.js";
import * as reviewRepo from "../repositories/review.repository.js";
import {
  requireAuth,
  requirePermission,
  requireOwnerOrAdmin,
} from "../middlewares/rbac.js";
import AppError from "../utils/AppError.js";

const router = express.Router({ mergeParams: true });

const fetchReview = async (req) => {
  const review = await reviewRepo.findById(req.params.reviewId);
  if (
    review &&
    String(review.listing?._id ?? review.listing) !==
      String(req.params.listingId)
  ) {
    return null;
  }
  return review;
};

const requireReviewAuthor = asyncHandler(async (req, _res, next) => {
  const review = await fetchReview(req);
  if (!review) throw AppError.notFound("Review not found");

  const authorId = review.author?._id ?? review.author;
  if (String(authorId) !== String(req.user._id)) {
    throw AppError.forbidden("You can only add photos to your own reviews");
  }

  next();
});

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
  requireReviewAuthor,
  listingImageUpload.array("photos", 5),
  validateFileType,
  asyncHandler(reviewCtrl.addPhotos),
);

router.delete(
  "/:reviewId/photos/:photoId",
  requireAuth(),
  asyncHandler(reviewCtrl.deletePhoto),
);

export default router;
