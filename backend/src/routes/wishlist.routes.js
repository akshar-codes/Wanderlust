import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import * as wishlistCtrl from "../controllers/wishlist.controller.js";
import validate from "../middlewares/validate.js";
import {
  toggleWishlistBodySchema,
  moveWishlistItemBodySchema,
} from "../validators/index.js";
import { requireAuth } from "../middlewares/rbac.js";

const router = express.Router();

router.get("/", requireAuth(), asyncHandler(wishlistCtrl.index));

router.get(
  "/status/:listingId",
  requireAuth(),
  asyncHandler(wishlistCtrl.status),
);

router.post(
  "/:listingId",
  requireAuth(),
  validate(toggleWishlistBodySchema),
  asyncHandler(wishlistCtrl.toggle),
);

router.delete("/:listingId", requireAuth(), asyncHandler(wishlistCtrl.destroy));

router.post(
  "/:listingId/move",
  requireAuth(),
  validate(moveWishlistItemBodySchema),
  asyncHandler(wishlistCtrl.move),
);

export default router;
