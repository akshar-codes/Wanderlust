import { useEffect, useState } from "react";
import { useSearchParams, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { useVerifyEmail, useResendVerification } from "../hooks/useAuth";
import { useAuthStore } from "../store/auth.store";
import { AuthCard, AuthBrand } from "../components/auth/AuthShared";
import Spinner from "../components/common/Spinner";

// ─── Pending state (no token / just signed up) ────────────────────────────────
function PendingVerification() {
  const { user } = useAuthStore();
  const {
    mutate: resend,
    isPending,
    isSuccess: resent,
    error,
  } = useResendVerification();
  const [countdown, setCountdown] = useState(0);

  const handleResend = () => {
    resend(undefined, {
      onSuccess: () => {
        setCountdown(60);
        const t = setInterval(
          () =>
            setCountdown((c) => {
              if (c <= 1) {
                clearInterval(t);
                return 0;
              }
              return c - 1;
            }),
          1000,
        );
      },
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
          border: "1.5px solid #93c5fd",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Mail size={30} color="#3b82f6" strokeWidth={1.5} />
      </motion.div>

      <div>
        <h2
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "1.7rem",
            color: "#261f1a",
            marginBottom: 8,
          }}
        >
          Verify your email
        </h2>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#8a8179",
            lineHeight: 1.65,
            maxWidth: 320,
          }}
        >
          We sent a verification link to{" "}
          <strong style={{ color: "#3d3630" }}>
            {user?.email || "your email"}
          </strong>
          . Click it to activate your account.
        </p>
      </div>

      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            borderRadius: 10,
            padding: "10px 16px",
            fontSize: "0.8rem",
            color: "#b91c1c",
            width: "100%",
          }}
        >
          {error.message}
        </div>
      )}

      {resent && !error && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 10,
            padding: "10px 16px",
            fontSize: "0.8rem",
            color: "#166534",
            width: "100%",
          }}
        >
          ✓ Verification email resent — check your inbox.
        </div>
      )}

      <div
        style={{
          background: "#faf8f6",
          border: "1px solid #ebe7e3",
          borderRadius: 14,
          padding: "16px 20px",
          fontSize: "0.8125rem",
          color: "#8a8179",
          lineHeight: 1.55,
          width: "100%",
          textAlign: "left",
        }}
      >
        <p style={{ fontWeight: 600, color: "#5c544c", marginBottom: 8 }}>
          Didn't get it?
        </p>
        <ul
          style={{
            paddingLeft: 16,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            listStyleType: "disc",
          }}
        >
          <li>Check your spam or junk folder</li>
          <li>Make sure you entered the right email</li>
          <li>
            <button
              type="button"
              onClick={countdown === 0 && !isPending ? handleResend : undefined}
              disabled={countdown > 0 || isPending}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                fontFamily: "inherit",
                fontSize: "inherit",
                color: countdown === 0 ? "#ff5a5f" : "#b8b0a8",
                fontWeight: 600,
                cursor: countdown === 0 ? "pointer" : "default",
                textDecoration: countdown === 0 ? "underline" : "none",
              }}
            >
              {isPending
                ? "Sending…"
                : countdown > 0
                  ? `Resend available in ${countdown}s`
                  : "Resend the verification email"}
            </button>
          </li>
        </ul>
      </div>

      <Link
        to="/listings"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: "0.875rem",
          color: "#8a8179",
          textDecoration: "none",
          fontWeight: 500,
        }}
      >
        Skip for now — go to listings
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}

// ─── Token verification ───────────────────────────────────────────────────────
function TokenVerification({ token }) {
  const {
    mutate: verifyEmail,
    isPending,
    isSuccess,
    isError,
    error,
  } = useVerifyEmail();

  useEffect(() => {
    verifyEmail(token);
  }, [token]);

  if (isPending) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          padding: "12px 0",
          textAlign: "center",
        }}
      >
        <Spinner size={40} />
        <p style={{ fontSize: "0.9rem", color: "#8a8179" }}>
          Verifying your email…
        </p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.1,
            duration: 0.5,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
            border: "1.5px solid #6ee7b7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckCircle2 size={32} color="#10b981" strokeWidth={1.5} />
        </motion.div>

        <div>
          <h2
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "1.7rem",
              color: "#261f1a",
              marginBottom: 8,
            }}
          >
            Email verified!
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: "#8a8179",
              lineHeight: 1.65,
              maxWidth: 300,
            }}
          >
            Your account is now fully active. Start exploring and listing your
            spaces.
          </p>
        </div>

        <Link
          to="/listings"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "13px 28px",
            background: "linear-gradient(135deg, #ff5a5f, #e84040)",
            borderRadius: 999,
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.9375rem",
            textDecoration: "none",
            boxShadow: "0 4px 16px rgba(255,90,95,0.28)",
          }}
        >
          Explore listings
          <ArrowRight size={15} />
        </Link>
      </motion.div>
    );
  }

  if (isError) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: 18,
            background: "#fef2f2",
            border: "1.5px solid #fca5a5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AlertTriangle size={28} color="#ef4444" strokeWidth={1.5} />
        </div>
        <div>
          <h2
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "1.6rem",
              color: "#261f1a",
              marginBottom: 8,
            }}
          >
            Verification failed
          </h2>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#8a8179",
              lineHeight: 1.65,
              maxWidth: 300,
            }}
          >
            {error?.message || "This link is invalid or has expired."}{" "}
            Verification links are valid for 24 hours.
          </p>
        </div>
        <Link
          to="/verify-email/pending"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            background: "linear-gradient(135deg, #ff5a5f, #e84040)",
            borderRadius: 999,
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.875rem",
            textDecoration: "none",
            boxShadow: "0 4px 16px rgba(255,90,95,0.28)",
          }}
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return null;
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const token = searchParams.get("token");

  // /verify-email/pending shows the "check your inbox" state
  const isPendingRoute = location.pathname.endsWith("/pending");

  return (
    <AuthCard>
      <AuthBrand />
      {isPendingRoute || !token ? (
        <PendingVerification />
      ) : (
        <TokenVerification token={token} />
      )}
    </AuthCard>
  );
}
