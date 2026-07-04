import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import * as reviewCtrl from "../controllers/review.controller.js";
import { requireAuth } from "../middlewares/rbac.js";

const router = express.Router();

// GET /api/reviews/mine — reviews authored by the current user, across all listings
router.get("/mine", requireAuth(), asyncHandler(reviewCtrl.mine));

export default router;
