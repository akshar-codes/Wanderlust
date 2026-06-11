"use strict";

const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

// ── Transporter factory ───────────────────────────────────────────────────────

let _transporter = null;

async function getTransporter() {
  if (_transporter) return _transporter;

  const isDev = process.env.NODE_ENV !== "production";

  if (process.env.SMTP_HOST) {
    // ── Real SMTP (staging / production) ─────────────────────────────────────
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true", // true → port 465; false → STARTTLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Pool connections in production for throughput
      pool: !isDev,
      maxConnections: isDev ? 1 : 5,
    });

    logger.info("[Email] SMTP transporter initialised", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ?? 587,
    });
  } else {
    // ── Ethereal fallback (development only) ──────────────────────────────────
    if (!isDev) {
      throw new Error(
        "SMTP_HOST is required in production. " +
          "Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.",
      );
    }

    const testAccount = await nodemailer.createTestAccount();
    _transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    logger.info(
      "[Email] Ethereal test transporter initialised " +
        `(user: ${testAccount.user}). ` +
        "Preview sent emails at https://ethereal.email",
    );
  }

  return _transporter;
}

// ── Sender helper ─────────────────────────────────────────────────────────────

const DEFAULT_FROM =
  process.env.EMAIL_FROM ?? "Wanderlust <no-reply@wanderlust.com>";

async function sendMail({ to, subject, html, text, from = DEFAULT_FROM }) {
  const transporter = await getTransporter();

  const info = await transporter.sendMail({ from, to, subject, html, text });

  // In dev, log the Ethereal preview URL so engineers can inspect the email
  if (process.env.NODE_ENV !== "production") {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info(`[Email] Preview: ${previewUrl}`, {
        to,
        subject,
        messageId: info.messageId,
      });
    }
  }

  logger.info("[Email] Sent", { to, subject, messageId: info.messageId });
  return info;
}

// ── Specific email templates ──────────────────────────────────────────────────

async function sendPasswordResetEmail({
  to,
  username,
  resetToken,
  expiresInMinutes = 60,
}) {
  const frontendBase = process.env.FRONTEND_URL ?? "http://localhost:5173";

  // The React app's reset-password page must accept `?token=<raw>&email=<email>`
  const resetUrl = `${frontendBase}/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(to)}`;

  const subject = "Reset your Wanderlust password";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background: #faf8f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #261f1a; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 16px rgba(38,31,26,0.08); }
    .header { background: #ff5a5f; padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; color: rgba(255,255,255,0.85); font-size: 14px; }
    .body { padding: 40px; }
    .body p { margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #4a3f38; }
    .body p.greeting { font-size: 17px; font-weight: 600; color: #261f1a; }
    .cta-wrapper { text-align: center; margin: 32px 0; }
    .cta { display: inline-block; background: #ff5a5f; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; letter-spacing: 0.2px; }
    .cta:hover { background: #e04e53; }
    .divider { border: none; border-top: 1px solid #f0ebe8; margin: 28px 0; }
    .fallback { background: #faf8f6; border-radius: 8px; padding: 16px; word-break: break-all; }
    .fallback code { font-size: 12px; color: #6b5f58; }
    .footer { padding: 24px 40px; text-align: center; background: #f5f0ed; }
    .footer p { margin: 0; font-size: 12px; color: #9c8f87; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🌍 Wanderlust</h1>
      <p>Your travel companion</p>
    </div>
    <div class="body">
      <p class="greeting">Hi ${escapeHtml(username)},</p>
      <p>We received a request to reset the password for your Wanderlust account. Click the button below to choose a new password.</p>

      <div class="cta-wrapper">
        <a href="${resetUrl}" class="cta">Reset my password</a>
      </div>

      <p>This link will expire in <strong>${expiresInMinutes} minutes</strong>. If you did not request a password reset, you can safely ignore this email — your password will not change.</p>

      <hr class="divider" />

      <p style="font-size:13px;color:#7a6f68;">If the button above doesn't work, copy and paste this URL into your browser:</p>
      <div class="fallback">
        <code>${resetUrl}</code>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Wanderlust. All rights reserved.<br />
      This email was sent to ${escapeHtml(to)} because a password reset was requested for your account.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text =
    `Hi ${username},\n\n` +
    `We received a request to reset your Wanderlust password.\n\n` +
    `Reset link (expires in ${expiresInMinutes} minutes):\n${resetUrl}\n\n` +
    `If you did not request this, you can ignore this email.\n\n` +
    `— The Wanderlust Team`;

  return sendMail({ to, subject, html, text });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

module.exports = {
  sendMail,
  sendPasswordResetEmail,
};
