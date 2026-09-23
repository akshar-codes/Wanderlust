import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import {
  connectTestDB,
  disconnectTestDB,
  clearCollections,
} from "../helpers/db.js";
import { makeUser } from "../helpers/factories.js";
import * as passwordResetService from "../../src/services/passwordReset.service.js";
import * as verificationService from "../../src/services/emailVerification.service.js";
import PasswordResetToken from "../../src/models/passwordResetToken.js";
import EmailVerificationToken from "../../src/models/emailVerificationToken.js";

describe("Token Security Tests", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await clearCollections();
  });

  describe("Password Reset Tokens", () => {
    it("prevents reuse of a reset token", async () => {
      const user = await makeUser();

      const { _devToken } = await passwordResetService.initiateForgotPassword({
        email: user.email,
      });

      // First use succeeds
      await passwordResetService.consumeResetToken({
        token: _devToken,
        newPassword: "NewPassword123!",
      });

      // Second use throws AppError
      await expect(
        passwordResetService.consumeResetToken({
          token: _devToken,
          newPassword: "AnotherPassword123!",
        }),
      ).rejects.toThrow(/Invalid or expired token/);
    });

    it("prevents use of an expired token", async () => {
      const user = await makeUser();
      const { _devToken } = await passwordResetService.initiateForgotPassword({
        email: user.email,
      });

      // Manually backdate the token
      await PasswordResetToken.updateOne(
        { userId: user._id },
        { $set: { expiresAt: new Date(Date.now() - 1000) } },
      );

      await expect(
        passwordResetService.consumeResetToken({
          token: _devToken,
          newPassword: "NewPassword123!",
        }),
      ).rejects.toThrow(/Invalid or expired token/);
    });

    it("rejects invalid/tampered tokens", async () => {
      await expect(
        passwordResetService.consumeResetToken({
          token: "invalid-token",
          newPassword: "NewPassword123!",
        }),
      ).rejects.toThrow(/Invalid or expired token/);
    });
  });

  describe("Email Verification Tokens", () => {
    it("prevents reuse of a verification token", async () => {
      const user = await makeUser({ emailVerified: false });
      const { _devToken } = await verificationService.initiateVerification({
        user,
      });

      // First use succeeds
      await verificationService.consumeVerificationToken({ token: _devToken });

      // Second use throws
      await expect(
        verificationService.consumeVerificationToken({ token: _devToken }),
      ).rejects.toThrow(/Invalid or expired verification link/);
    });

    it("prevents use of an expired verification token", async () => {
      const user = await makeUser({ emailVerified: false });
      const { _devToken } = await verificationService.initiateVerification({
        user,
      });

      // Manually backdate the token
      await EmailVerificationToken.updateOne(
        { userId: user._id },
        { $set: { expiresAt: new Date(Date.now() - 1000) } },
      );

      await expect(
        verificationService.consumeVerificationToken({ token: _devToken }),
      ).rejects.toThrow(/Invalid or expired verification link/);
    });
  });
});
