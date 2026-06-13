import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { AuthCard, AuthBrand } from "../../components/auth/AuthShared";
import Spinner from "../../components/common/Spinner";

const ERROR_MESSAGES = {
  oauth_error: "An error occurred with the OAuth provider. Please try again.",
  authentication_failed:
    "Authentication failed — please try a different login method.",
  email_already_exists:
    "An account with this email already exists. Please log in instead.",
  provider_already_linked:
    "This provider account is already linked to a different Wanderlust account.",
  default: "Something went wrong during sign-in. Please try again.",
};

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { init, isAuthenticated } = useAuthStore();
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  const authError = searchParams.get("auth_error");

  useEffect(() => {
    if (authError) {
      setErrorMsg(ERROR_MESSAGES[authError] ?? ERROR_MESSAGES.default);
      setStatus("error");
      // Auto-redirect to login after 4 s
      const t = setTimeout(() => navigate("/login", { replace: true }), 4000);
      return () => clearTimeout(t);
    }

    // No error — hydrate the session from /api/auth/me
    init().then(() => {
      setStatus("success");
      // Brief success flash, then redirect
      const t = setTimeout(
        () => navigate("/listings", { replace: true }),
        1200,
      );
      return () => clearTimeout(t);
    });
  }, [authError, init, navigate]);

  return (
    <AuthCard>
      <AuthBrand />

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
        {status === "loading" && (
          <>
            <Spinner size={40} />
            <div>
              <h2
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: "1.5rem",
                  color: "#261f1a",
                  marginBottom: 8,
                }}
              >
                Signing you in…
              </h2>
              <p style={{ fontSize: "0.875rem", color: "#8a8179" }}>
                Just a moment while we set up your session.
              </p>
            </div>
          </>
        )}

        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.1,
                duration: 0.45,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              style={{
                width: 68,
                height: 68,
                borderRadius: 20,
                background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                border: "1.5px solid #6ee7b7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle2 size={30} color="#10b981" strokeWidth={1.5} />
            </motion.div>
            <div>
              <h2
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: "1.5rem",
                  color: "#261f1a",
                  marginBottom: 6,
                }}
              >
                You're in!
              </h2>
              <p style={{ fontSize: "0.875rem", color: "#8a8179" }}>
                Redirecting you to your dashboard…
              </p>
            </div>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
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
              <XCircle size={30} color="#ef4444" strokeWidth={1.5} />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: "1.5rem",
                  color: "#261f1a",
                  marginBottom: 8,
                }}
              >
                Sign-in failed
              </h2>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#8a8179",
                  lineHeight: 1.6,
                  maxWidth: 300,
                }}
              >
                {errorMsg}
              </p>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#b8b0a8",
                  marginTop: 10,
                }}
              >
                Redirecting you to login in a few seconds…
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </AuthCard>
  );
}
