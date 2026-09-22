import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import * as twoFactorCtrl from "../controllers/twoFactor.controller.js";
import { requireAuth } from "../middlewares/rbac.js";
import { authLimiter } from "../config/rateLimiter.config.js";

const router = express.Router();

// ── Setup and Management (Requires fully authenticated session) ───────────────
router.post("/generate", requireAuth(), asyncHandler(twoFactorCtrl.generate));
router.post("/enable", requireAuth(), asyncHandler(twoFactorCtrl.enable));
router.post("/disable", requireAuth(), asyncHandler(twoFactorCtrl.disable));
router.post(
  "/recovery-codes",
  requireAuth(),
  asyncHandler(twoFactorCtrl.generateRecoveryCodes),
);

// ── Login Verification (Uses pending session) ──────────────────────────────────
// This route is public so that users with a pending session can access it.
router.post("/verify", authLimiter, asyncHandler(twoFactorCtrl.verifyLogin));

export default router;
