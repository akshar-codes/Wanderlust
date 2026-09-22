import * as twoFactorService from "../services/twoFactor.service.js";
import AppError from "../utils/AppError.js";

export const generate = async (req, res) => {
  if (req.user.settings.twoFactorEnabled) {
    throw new AppError(400, "Two-factor authentication is already enabled");
  }

  const { secret, qrCodeUrl } = await twoFactorService.generateSecret(req.user);

  res.json({
    success: true,
    data: {
      secret, // Sent only once for setup
      qrCodeUrl,
    },
  });
};

export const enable = async (req, res) => {
  const { secret, token } = req.body;
  if (!secret || !token) {
    throw new AppError(400, "Secret and token are required");
  }

  const { recoveryCodes } = await twoFactorService.enableTwoFactor(
    req.user._id,
    secret,
    token,
  );

  res.json({
    success: true,
    data: {
      recoveryCodes,
      message: "Two-factor authentication enabled successfully",
    },
  });
};

export const disable = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    throw new AppError(400, "Token is required");
  }

  await twoFactorService.disableTwoFactor(req.user._id, token);

  res.json({
    success: true,
    message: "Two-factor authentication disabled",
  });
};

export const generateRecoveryCodes = async (req, res) => {
  const { token } = req.body;

  // Must verify TOTP before regenerating codes
  await twoFactorService.verifyLogin(req.user._id, token);

  const { codes, hashedCodes } = await twoFactorService.generateRecoveryCodes();

  // Overwrite existing codes
  const User = (await import("../models/user.js")).default;
  await User.findByIdAndUpdate(req.user._id, {
    "twoFactor.recoveryCodes": hashedCodes,
    "twoFactor.recoveryCodesGeneratedAt": new Date(),
  });

  res.json({
    success: true,
    data: {
      recoveryCodes: codes,
    },
  });
};

export const verifyLogin = async (req, res, next) => {
  // This endpoint is used to solve a pending 2FA challenge.
  if (!req.session.pendingTwoFactor?.userId) {
    return next(new AppError(400, "No pending two-factor authentication"));
  }

  const { token, recoveryCode } = req.body;
  const userId = req.session.pendingTwoFactor.userId;

  if (recoveryCode) {
    await twoFactorService.verifyAndConsumeRecoveryCode(userId, recoveryCode);
  } else if (token) {
    await twoFactorService.verifyLogin(userId, token);
  } else {
    return next(new AppError(400, "Token or recoveryCode is required"));
  }

  // Find user and log them in
  const User = (await import("../models/user.js")).default;
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError(404, "User not found"));
  }

  // Prevent session fixation
  const oldSessionData = { ...req.session };
  delete oldSessionData.pendingTwoFactor;

  req.session.regenerate((err) => {
    if (err) return next(err);

    // Restore old session data (except pendingTwoFactor)
    Object.assign(req.session, oldSessionData);

    req.logIn(user, (err) => {
      if (err) return next(err);
      res.json({
        success: true,
        data: { user },
        message: "Logged in successfully",
      });
    });
  });
};
