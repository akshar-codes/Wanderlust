import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import * as wishlistCtrl from "../controllers/wishlist.controller.js";
import { requireAuth } from "../middlewares/rbac.js";

const router = express.Router();

router.get("/", requireAuth(), asyncHandler(wishlistCtrl.index));
router.post("/:listingId", requireAuth(), asyncHandler(wishlistCtrl.toggle));
router.delete("/:listingId", requireAuth(), asyncHandler(wishlistCtrl.destroy));

export default router;
