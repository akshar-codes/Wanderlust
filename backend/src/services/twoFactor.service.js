import crypto from "crypto";
import {
  generateSecret as generateTOTPSecret,
  generateURI,
  verifySync,
} from "otplib";
import qrcode from "qrcode";
import bcrypt from "bcryptjs";
import AppError from "../utils/AppError.js";
import User from "../models/user.js";

// TOTP Secret Encryption
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

const getEncryptionKey = () => {
  const key = process.env.TWO_FACTOR_ENCRYPTION_KEY;
  if (!key || Buffer.from(key, "hex").length !== 32) {
    throw new Error(
      "TWO_FACTOR_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)",
    );
  }
  return Buffer.from(key, "hex");
};

export const encryptSecret = (secret) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);

  let encrypted = cipher.update(secret, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
};

export const decryptSecret = (encryptedData) => {
  if (!encryptedData) return null;
  const parts = encryptedData.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted secret format");

  const [ivHex, authTagHex, encryptedHex] = parts;
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivHex, "hex"),
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

// ── Service Methods ────────────────────────────────────────────────────────────

export const generateSecret = async (user) => {
  const secret = generateTOTPSecret();
  const otpauthUrl = generateURI({
    label: user.email,
    issuer: "Wanderlust",
    secret,
  });
  const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);
  return { secret, qrCodeUrl };
};

export const verifyToken = (secret, token) => {
  const result = verifySync({ token, secret });
  return result.valid;
};

export const generateRecoveryCodes = async () => {
  const codes = [];
  const hashedCodes = [];

  for (let i = 0; i < 8; i++) {
    // Generate a secure 10-char hex code formatted as XXXXX-XXXXX
    const bytes = crypto.randomBytes(10).toString("hex");
    const code = `${bytes.slice(0, 5)}-${bytes.slice(5, 10)}`.toUpperCase();
    codes.push(code);

    // Hash before saving
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(code, salt);
    hashedCodes.push(hash);
  }

  return { codes, hashedCodes };
};

export const enableTwoFactor = async (userId, secret, token) => {
  if (!verifyToken(secret, token)) {
    throw new AppError(400, "Invalid TOTP code", { code: "INVALID_TOTP" });
  }

  const encryptedSecret = encryptSecret(secret);
  const { codes, hashedCodes } = await generateRecoveryCodes();

  await User.findByIdAndUpdate(userId, {
    "twoFactor.secret": encryptedSecret,
    "twoFactor.recoveryCodes": hashedCodes,
    "twoFactor.recoveryCodesGeneratedAt": new Date(),
    "settings.twoFactorEnabled": true,
  });

  return { recoveryCodes: codes };
};

export const disableTwoFactor = async (userId, token) => {
  const user = await User.findById(userId).select("+twoFactor.secret");
  if (!user.settings.twoFactorEnabled || !user.twoFactor?.secret) {
    throw new AppError(400, "Two-factor authentication is not enabled");
  }

  const secret = decryptSecret(user.twoFactor.secret);
  if (!verifyToken(secret, token)) {
    throw new AppError(400, "Invalid TOTP code", { code: "INVALID_TOTP" });
  }

  await User.findByIdAndUpdate(userId, {
    $unset: { twoFactor: "" },
    $set: { "settings.twoFactorEnabled": false },
  });
};

export const verifyAndConsumeRecoveryCode = async (userId, code) => {
  const user = await User.findById(userId).select("+twoFactor.recoveryCodes");
  if (!user || !user.twoFactor?.recoveryCodes) {
    throw new AppError(400, "Recovery codes not available");
  }

  const normalizedCode = code.toUpperCase().trim();
  const codes = user.twoFactor.recoveryCodes;

  for (let i = 0; i < codes.length; i++) {
    const isMatch = await bcrypt.compare(normalizedCode, codes[i]);
    if (isMatch) {
      // Atomic consume: pull exactly this hash from the array
      const updated = await User.findOneAndUpdate(
        { _id: userId, "twoFactor.recoveryCodes": codes[i] },
        { $pull: { "twoFactor.recoveryCodes": codes[i] } },
        { new: true },
      );

      if (!updated) {
        throw new AppError(400, "Recovery code was already used", {
          code: "CODE_USED",
        });
      }
      return true;
    }
  }

  throw new AppError(400, "Invalid recovery code", {
    code: "INVALID_RECOVERY_CODE",
  });
};

export const verifyLogin = async (userId, token) => {
  const user = await User.findById(userId).select(
    "+twoFactor.secret +twoFactor.failedAttempts +twoFactor.lockedUntil",
  );

  if (!user || !user.settings.twoFactorEnabled || !user.twoFactor?.secret) {
    throw new AppError(400, "Two-factor authentication is not enabled");
  }

  // Check lockout
  if (user.twoFactor.lockedUntil && user.twoFactor.lockedUntil > new Date()) {
    throw new AppError(403, "Too many failed attempts. Try again later.");
  }

  const secret = decryptSecret(user.twoFactor.secret);
  const isValid = verifyToken(secret, token);

  if (!isValid) {
    const failedAttempts = (user.twoFactor.failedAttempts || 0) + 1;
    const update = { "twoFactor.failedAttempts": failedAttempts };

    if (failedAttempts >= 5) {
      update["twoFactor.lockedUntil"] = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
    }

    await User.findByIdAndUpdate(userId, update);
    throw new AppError(400, "Invalid TOTP code", { code: "INVALID_TOTP" });
  }

  // Reset counters on success
  await User.findByIdAndUpdate(userId, {
    $set: {
      "twoFactor.failedAttempts": 0,
      "twoFactor.lockedUntil": null,
    },
  });

  return true;
};
