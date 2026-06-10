/* ─── LoginPage.jsx ─────────────────────────────────────────── */
import { Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schemas";
import { useLogin } from "../hooks/useAuth";
import { Compass, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

function AuthCard({ children, title, subtitle, eyebrow }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100svh - 68px - 8rem)",
        padding: "40px 20px",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "15%",
            right: "10%",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,90,95,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            left: "5%",
            width: 240,
            height: 240,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(13,148,136,0.07) 0%, transparent 70%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "100%",
          maxWidth: 440,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(24px) saturate(1.6)",
          border: "1.5px solid rgba(230,224,218,0.8)",
          borderRadius: 28,
          padding: "44px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          boxShadow:
            "0 24px 80px rgba(61,43,26,0.12), 0 4px 16px rgba(61,43,26,0.06)",
        }}
      >
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <Compass size={26} color="#ff5a5f" />
          <span
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "1.15rem",
              color: "#261f1a",
            }}
          >
            Wanderlust
          </span>
        </motion.div>

        {eyebrow && (
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#ff5a5f",
            }}
          >
            {eyebrow}
          </p>
        )}
        <h1
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(1.6rem, 3vw, 1.9rem)",
            color: "#261f1a",
            lineHeight: 1.15,
            marginBottom: 2,
          }}
        >
          {title}
        </h1>
        <p style={{ fontSize: "0.9rem", color: "#8a8179", marginBottom: 12 }}>
          {subtitle}
        </p>

        {children}
      </motion.div>
    </div>
  );
}

function FormInput({
  label,
  id,
  error,
  type = "text",
  register,
  placeholder,
  autoComplete,
}) {
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPw ? "text" : "password") : type;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        htmlFor={id}
        style={{
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: "#5c544c",
          letterSpacing: "-0.003em",
        }}
      >
        {label}
      </label>
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
            background: "#faf8f6",
            border: `1.5px solid ${error ? "#ef4444" : "#d6d0ca"}`,
            borderRadius: 12,
            outline: "none",
            transition:
              "border-color 0.15s, box-shadow 0.15s, background 0.15s",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? "#ef4444" : "#ff5a5f";
            e.target.style.background = "#fff";
            e.target.style.boxShadow = error
              ? "0 0 0 3px rgba(239,68,68,0.15)"
              : "0 0 0 3px rgba(255,90,95,0.15)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? "#ef4444" : "#d6d0ca";
            e.target.style.background = "#faf8f6";
            e.target.style.boxShadow = "none";
          }}
        />
        {isPassword && (
          <button
            type="button"
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
            }}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{ fontSize: "0.8rem", color: "#b91c1c", fontWeight: 500 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoginPage() {
  const { mutate: login, isPending, error } = useLogin();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });
  const onSubmit = (data) => login(data);

  return (
    <AuthCard
      eyebrow="Welcome back"
      title="Sign in to continue"
      subtitle="Your next adventure is waiting."
    >
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            style={{
              background: "#fef2f2",
              border: "1.5px solid #fca5a5",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: "0.875rem",
              color: "#b91c1c",
              fontWeight: 500,
            }}
            role="alert"
          >
            {error.message}
          </motion.div>
        )}
      </AnimatePresence>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <FormInput
          label="Username"
          id="username"
          register={register("username")}
          error={errors.username?.message}
          placeholder="your_username"
          autoComplete="username"
        />
        <FormInput
          label="Password"
          id="password"
          type="password"
          register={register("password")}
          error={errors.password?.message}
          placeholder="••••••••"
          autoComplete="current-password"
        />

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Link
            to="#"
            style={{
              fontSize: "0.8rem",
              color: "#ff5a5f",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Forgot password?
          </Link>
        </div>

        <motion.button
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.98 }}
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
            boxShadow: isPending ? "none" : "0 4px 20px rgba(255,90,95,0.3)",
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
                }}
              />
              Signing in…
            </>
          ) : (
            "Log in"
          )}
        </motion.button>
      </form>

      {/* Divider */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          margin: "4px 0",
        }}
      >
        <div style={{ flex: 1, height: 1, background: "#ebe7e3" }} />
        <span
          style={{ fontSize: "0.75rem", color: "#b8b0a8", fontWeight: 500 }}
        >
          or
        </span>
        <div style={{ flex: 1, height: 1, background: "#ebe7e3" }} />
      </div>

      {/* OAuth placeholder */}
      <motion.button
        whileHover={{ scale: 1.01, background: "#faf8f6" }}
        whileTap={{ scale: 0.98 }}
        type="button"
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
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
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
        Continue with Google
      </motion.button>

      <p
        style={{
          fontSize: "0.875rem",
          color: "#8a8179",
          textAlign: "center",
          paddingTop: 8,
          borderTop: "1px solid #ebe7e3",
        }}
      >
        Don't have an account?{" "}
        <Link
          to="/signup"
          state={location.state}
          style={{ color: "#ff5a5f", fontWeight: 700, textDecoration: "none" }}
        >
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}

/* ─── SignupPage.jsx ─────────────────────────────────────────── */
export function SignupPage() {
  const { mutate: signup, isPending, error } = useSignup_();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema_) });
  const onSubmit = (data) => signup(data);

  return (
    <AuthCard
      eyebrow="Join the community"
      title="Create your account"
      subtitle="Start your journey with Wanderlust today."
    >
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: "#fef2f2",
              border: "1.5px solid #fca5a5",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: "0.875rem",
              color: "#b91c1c",
              fontWeight: 500,
            }}
            role="alert"
          >
            {error.message}
          </motion.div>
        )}
      </AnimatePresence>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <FormInput
          label="Username"
          id="su-username"
          register={register("username")}
          error={errors.username?.message}
          placeholder="choose_username"
          autoComplete="username"
        />
        <FormInput
          label="Email address"
          id="su-email"
          type="email"
          register={register("email")}
          error={errors.email?.message}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <FormInput
          label="Password"
          id="su-password"
          type="password"
          register={register("password")}
          error={errors.password?.message}
          placeholder="Min. 6 characters"
          autoComplete="new-password"
        />

        <p style={{ fontSize: "0.75rem", color: "#b8b0a8", lineHeight: 1.5 }}>
          By signing up you agree to our{" "}
          <Link
            to="/terms"
            style={{
              color: "#ff5a5f",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            to="/privacy"
            style={{
              color: "#ff5a5f",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Privacy Policy
          </Link>
          .
        </p>

        <motion.button
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.98 }}
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
            boxShadow: isPending ? "none" : "0 4px 20px rgba(255,90,95,0.3)",
          }}
        >
          {isPending ? "Creating account…" : "Create account"}
        </motion.button>
      </form>

      <p
        style={{
          fontSize: "0.875rem",
          color: "#8a8179",
          textAlign: "center",
          paddingTop: 8,
          borderTop: "1px solid #ebe7e3",
        }}
      >
        Already have an account?{" "}
        <Link
          to="/login"
          style={{ color: "#ff5a5f", fontWeight: 700, textDecoration: "none" }}
        >
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}

/* — thin re-exports so SignupPage can live in its own file — */
import { useSignup as useSignup_ } from "../hooks/useAuth";
import { signupSchema as signupSchema_ } from "../schemas";
