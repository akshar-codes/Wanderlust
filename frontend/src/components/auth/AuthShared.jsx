import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";

// ─── AuthCard ─────────────────────────────────────────────────────────────────
export function AuthCard({ children, maxWidth = 440 }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100svh - 68px)",
        padding: "40px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background blobs */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "12%",
            right: "8%",
            width: 360,
            height: 360,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,90,95,0.07) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            left: "6%",
            width: 280,
            height: 280,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(13,148,136,0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth,
          background: "rgba(255,255,255,0.94)",
          backdropFilter: "blur(28px) saturate(1.6)",
          WebkitBackdropFilter: "blur(28px) saturate(1.6)",
          border: "1.5px solid rgba(230,224,218,0.8)",
          borderRadius: 28,
          padding: "44px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          boxShadow:
            "0 24px 80px rgba(61,43,26,0.11), 0 4px 16px rgba(61,43,26,0.05)",
        }}
      >
        {children}
      </motion.div>

      <style>{`
        @media (max-width: 480px) {
          .auth-card-inner { padding: 32px 24px !important; border-radius: 20px !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Brand ────────────────────────────────────────────────────────────────────
export function AuthBrand() {
  return (
    <Link
      to="/"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        textDecoration: "none",
        marginBottom: 10,
      }}
    >
      <Compass size={24} color="#ff5a5f" />
      <span
        style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: "1.1rem",
          color: "#261f1a",
        }}
      >
        Wanderlust
      </span>
    </Link>
  );
}

// ─── AuthAlert — server error ─────────────────────────────────────────────────
export function AuthAlert({ message }) {
  if (!message) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8 }}
        role="alert"
        style={{
          background: "#fef2f2",
          border: "1.5px solid #fca5a5",
          borderRadius: 12,
          padding: "12px 16px",
          fontSize: "0.875rem",
          color: "#b91c1c",
          fontWeight: 500,
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <XCircle
          size={16}
          style={{ flexShrink: 0, marginTop: 1, color: "#ef4444" }}
        />
        {message}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── AuthSuccess ──────────────────────────────────────────────────────────────
export function AuthSuccess({ message }) {
  if (!message) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        role="status"
        style={{
          background: "#ecfdf5",
          border: "1.5px solid #6ee7b7",
          borderRadius: 12,
          padding: "12px 16px",
          fontSize: "0.875rem",
          color: "#065f46",
          fontWeight: 500,
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <CheckCircle2
          size={16}
          style={{ flexShrink: 0, marginTop: 1, color: "#10b981" }}
        />
        {message}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── FormInput ────────────────────────────────────────────────────────────────
export function FormInput({
  label,
  id,
  type = "text",
  error,
  register,
  placeholder,
  autoComplete,
  hint,
  required,
}) {
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPw ? "text" : "password") : type;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "#5c544c",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {label}
          {required && <span style={{ color: "#ff5a5f" }}>*</span>}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={inputType}
          autoComplete={autoComplete}
          placeholder={placeholder}
          {...register}
          style={{
            display: "block",
            width: "100%",
            padding: isPassword ? "12px 44px 12px 16px" : "12px 16px",
            fontSize: "0.9375rem",
            fontFamily: "inherit",
            color: "#261f1a",
            background: error ? "#fff9f9" : "#faf8f6",
            border: `1.5px solid ${error ? "#fca5a5" : "#d6d0ca"}`,
            borderRadius: 12,
            outline: "none",
            transition:
              "border-color 0.15s, box-shadow 0.15s, background 0.15s",
            boxSizing: "border-box",
            WebkitAppearance: "none",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? "#ef4444" : "#ff5a5f";
            e.target.style.background = "#fff";
            e.target.style.boxShadow = error
              ? "0 0 0 3px rgba(239,68,68,0.14)"
              : "0 0 0 3px rgba(255,90,95,0.14)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? "#fca5a5" : "#d6d0ca";
            e.target.style.background = error ? "#fff9f9" : "#faf8f6";
            e.target.style.boxShadow = "none";
          }}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPw((v) => !v)}
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#b8b0a8",
              padding: 2,
              display: "flex",
              alignItems: "center",
            }}
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {hint && !error && (
        <p style={{ fontSize: "0.75rem", color: "#b8b0a8", lineHeight: 1.4 }}>
          {hint}
        </p>
      )}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            role="alert"
            style={{
              fontSize: "0.8rem",
              color: "#b91c1c",
              fontWeight: 500,
              margin: 0,
            }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── AuthDivider ──────────────────────────────────────────────────────────────
export function AuthDivider({ label = "or" }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        margin: "4px 0",
      }}
    >
      <div style={{ flex: 1, height: 1, background: "#ebe7e3" }} />
      <span style={{ fontSize: "0.75rem", color: "#b8b0a8", fontWeight: 500 }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "#ebe7e3" }} />
    </div>
  );
}

// ─── SubmitButton ─────────────────────────────────────────────────────────────
export function SubmitButton({ isPending, label, loadingLabel }) {
  return (
    <motion.button
      whileHover={!isPending ? { scale: 1.01, y: -1 } : {}}
      whileTap={!isPending ? { scale: 0.98 } : {}}
      type="submit"
      disabled={isPending}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "14px",
        width: "100%",
        background: isPending
          ? "#f4f1ee"
          : "linear-gradient(135deg, #ff5a5f, #e84040)",
        border: "none",
        borderRadius: 14,
        fontWeight: 700,
        fontSize: "0.9375rem",
        color: isPending ? "#b8b0a8" : "#fff",
        cursor: isPending ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        boxShadow: isPending ? "none" : "0 4px 20px rgba(255,90,95,0.28)",
        transition: "all 0.2s",
      }}
    >
      {isPending ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              border: "2px solid #d6d0ca",
              borderTopColor: "#ff5a5f",
              flexShrink: 0,
            }}
          />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </motion.button>
  );
}

// ─── GoogleButton ─────────────────────────────────────────────────────────────
export function GoogleButton({ label = "Continue with Google" }) {
  return (
    <motion.a
      href="/api/auth/google"
      whileHover={{ scale: 1.01, background: "#faf8f6" }}
      whileTap={{ scale: 0.98 }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "12px",
        background: "#fff",
        border: "1.5px solid #d6d0ca",
        borderRadius: 14,
        fontWeight: 600,
        fontSize: "0.875rem",
        color: "#3d3630",
        textDecoration: "none",
        fontFamily: "inherit",
        transition: "all 0.15s",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
        <path
          fill="#4285F4"
          d="M47.5 24.6c0-1.6-.1-3.1-.4-4.6H24v8.7h13.2c-.6 3-2.4 5.5-5 7.2v6h8.1c4.7-4.4 7.2-10.9 7.2-17.3z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-8.1-6c-2.2 1.5-5 2.4-7.8 2.4-6 0-11.1-4-12.9-9.4H2.8v6.2C6.8 42.6 14.9 48 24 48z"
        />
        <path
          fill="#FBBC04"
          d="M11.1 29.2c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6v-6.2H2.8C1 17.1 0 20.4 0 24s1 6.9 2.8 10.2l8.3-5z"
        />
        <path
          fill="#EA4335"
          d="M24 9.5c3.4 0 6.4 1.2 8.8 3.4l6.6-6.6C35.9 2.6 30.5 0 24 0 14.9 0 6.8 5.4 2.8 13.8l8.3 6.2C12.9 13.5 18 9.5 24 9.5z"
        />
      </svg>
      {label}
    </motion.a>
  );
}

// ─── PasswordStrength ─────────────────────────────────────────────────────────
function getStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score: 1, label: "Weak", color: "#ef4444" };
  if (score <= 2) return { score: 2, label: "Fair", color: "#f59e0b" };
  if (score <= 3) return { score: 3, label: "Good", color: "#22c55e" };
  return { score: 4, label: "Strong", color: "#10b981" };
}

export function PasswordStrength({ password }) {
  const { score, label, color } = getStrength(password);
  if (!password) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: i <= score ? color : "#ebe7e3",
              transition: "background 0.25s",
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: "0.72rem", color, fontWeight: 600 }}>{label}</p>
    </div>
  );
}

// ─── AuthFooter ───────────────────────────────────────────────────────────────
export function AuthFooter({ children }) {
  return (
    <p
      style={{
        fontSize: "0.875rem",
        color: "#8a8179",
        textAlign: "center",
        paddingTop: 8,
        borderTop: "1px solid #ebe7e3",
      }}
    >
      {children}
    </p>
  );
}

export function AuthLink({ to, children }) {
  return (
    <Link
      to={to}
      style={{ color: "#ff5a5f", fontWeight: 700, textDecoration: "none" }}
    >
      {children}
    </Link>
  );
}
