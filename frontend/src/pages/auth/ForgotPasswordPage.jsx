import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { useForgotPassword } from "../../hooks/useAuth";
import {
  AuthCard,
  AuthBrand,
  AuthAlert,
  FormInput,
  SubmitButton,
  AuthFooter,
  AuthLink,
} from "../../components/auth/AuthShared";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

function ConfirmationScreen({ email, onResend, isResending }) {
  const [countdown, setCountdown] = useState(60);

  useState(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        alignItems: "center",
        textAlign: "center",
      }}
    >
      {/* Icon */}
      <div
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
        <Mail size={30} color="#10b981" strokeWidth={1.5} />
      </div>

      <div>
        <h2
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "1.7rem",
            color: "#261f1a",
            marginBottom: 10,
          }}
        >
          Check your inbox
        </h2>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#8a8179",
            lineHeight: 1.65,
            maxWidth: 320,
          }}
        >
          We sent a reset link to{" "}
          <strong style={{ color: "#3d3630" }}>{email}</strong>. It expires in 1
          hour.
        </p>
      </div>

      <div
        style={{
          background: "#faf8f6",
          border: "1px solid #ebe7e3",
          borderRadius: 14,
          padding: "14px 20px",
          fontSize: "0.8125rem",
          color: "#8a8179",
          lineHeight: 1.5,
          width: "100%",
        }}
      >
        Didn't receive it? Check your spam folder or{" "}
        <button
          type="button"
          onClick={countdown === 0 ? onResend : undefined}
          disabled={countdown > 0 || isResending}
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
          {isResending
            ? "Sending…"
            : countdown > 0
              ? `resend in ${countdown}s`
              : "resend the email"}
        </button>
      </div>

      <Link
        to="/login"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: "0.875rem",
          color: "#5c544c",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        <ArrowLeft size={14} />
        Back to login
      </Link>
    </motion.div>
  );
}

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState(null);
  const {
    mutate: forgotPassword,
    isPending,
    error,
    reset,
  } = useForgotPassword();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = ({ email }) => {
    forgotPassword(email, {
      onSuccess: () => setSentTo(email),
    });
  };

  const handleResend = () => {
    const email = sentTo || getValues("email");
    forgotPassword(email, {
      onSuccess: () => setSentTo(email),
    });
  };

  return (
    <AuthCard>
      <AuthBrand />

      <AnimatePresence mode="wait">
        {sentTo ? (
          <ConfirmationScreen
            key="sent"
            email={sentTo}
            onResend={handleResend}
            isResending={isPending}
          />
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div style={{ marginBottom: 8 }}>
              <p
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#ff5a5f",
                  marginBottom: 6,
                }}
              >
                Password recovery
              </p>
              <h1
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: "clamp(1.5rem, 3vw, 1.85rem)",
                  color: "#261f1a",
                  lineHeight: 1.15,
                  marginBottom: 6,
                }}
              >
                Forgot your password?
              </h1>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#8a8179",
                  lineHeight: 1.6,
                }}
              >
                Enter the email linked to your account and we'll send you a
                secure reset link.
              </p>
            </div>

            <AuthAlert message={error?.message} />

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <FormInput
                label="Email address"
                id="fp-email"
                type="email"
                register={register("email")}
                error={errors.email?.message}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
              <SubmitButton
                isPending={isPending}
                label="Send reset link"
                loadingLabel="Sending…"
              />
            </form>

            <AuthFooter>
              Remembered it? <AuthLink to="/login">Back to login</AuthLink>
            </AuthFooter>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthCard>
  );
}
