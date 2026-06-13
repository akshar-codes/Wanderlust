import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../store/auth.store";
import { useResendVerification } from "../../hooks/useAuth";

export default function EmailVerificationBanner() {
  const { isAuthenticated, user } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);
  const { mutate: resend, isPending, isSuccess } = useResendVerification();

  // Only show for authenticated users with unverified email
  if (!isAuthenticated || user?.emailVerified || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3 }}
        role="alert"
        style={{
          background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
          border: "1px solid #fcd34d",
          borderRadius: 14,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
          boxShadow: "0 2px 8px rgba(245,158,11,0.12)",
        }}
      >
        <Mail size={18} style={{ color: "#d97706", flexShrink: 0 }} />
        <p
          style={{
            flex: 1,
            fontSize: "0.875rem",
            color: "#92400e",
            lineHeight: 1.5,
          }}
        >
          <strong>Verify your email</strong> to create listings and access all
          features.{" "}
          {isSuccess ? (
            <span style={{ color: "#065f46", fontWeight: 500 }}>
              Email sent — check your inbox!
            </span>
          ) : (
            <button
              type="button"
              onClick={() => resend()}
              disabled={isPending}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                fontFamily: "inherit",
                fontSize: "inherit",
                color: "#d97706",
                fontWeight: 700,
                cursor: isPending ? "default" : "pointer",
                textDecoration: "underline",
                textUnderlineOffset: 2,
              }}
            >
              {isPending ? "Sending…" : "Resend verification email"}
            </button>
          )}{" "}
          or{" "}
          <Link
            to="/verify-email/pending"
            style={{
              color: "#b45309",
              fontWeight: 600,
              textDecoration: "underline",
              textUnderlineOffset: 2,
            }}
          >
            learn more
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#92400e",
            opacity: 0.7,
            padding: 2,
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <X size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
