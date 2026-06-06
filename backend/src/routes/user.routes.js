const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");
const userCtrl = require("../controllers/user.controller");
const isLoggedIn = require("../middlewares/isLoggedIn");

/**
 * GET  /api/users/:username   → public profile
 * GET  /api/users/:username/listings → listings owned by this user
 */
router.get("/:username", asyncHandler(userCtrl.profile));
router.get("/:username/listings", asyncHandler(userCtrl.listings));

/**
 * DELETE /api/users/:username  → delete own account (auth required)
 */
router.delete("/:username", isLoggedIn, asyncHandler(userCtrl.destroy));

module.exports = router;
