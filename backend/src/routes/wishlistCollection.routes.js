import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import * as collectionCtrl from "../controllers/wishlistCollection.controller.js";
import validate from "../middlewares/validate.js";
import {
  createCollectionBodySchema,
  updateCollectionBodySchema,
} from "../validators/index.js";
import { requireAuth } from "../middlewares/rbac.js";

const router = express.Router();

// ── Public — shared read-only view, no auth ────────────────────────────────────
router.get("/shared/:token", asyncHandler(collectionCtrl.showShared));

// ── Collection CRUD ─────────────────────────────────────────────────────────────
router
  .route("/")
  .get(requireAuth(), asyncHandler(collectionCtrl.index))
  .post(
    requireAuth(),
    validate(createCollectionBodySchema),
    asyncHandler(collectionCtrl.create),
  );

router
  .route("/:id")
  .get(requireAuth(), asyncHandler(collectionCtrl.show))
  .patch(
    requireAuth(),
    validate(updateCollectionBodySchema),
    asyncHandler(collectionCtrl.update),
  )
  .delete(requireAuth(), asyncHandler(collectionCtrl.destroy));

// ── Sharing ─────────────────────────────────────────────────────────────────────
router
  .route("/:id/share")
  .post(requireAuth(), asyncHandler(collectionCtrl.share))
  .delete(requireAuth(), asyncHandler(collectionCtrl.unshare));

export default router;
