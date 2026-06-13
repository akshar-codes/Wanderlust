import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { useResetPassword } from "../../hooks/useAuth";
import {
  AuthCard,
  AuthBrand,
  AuthAlert,
  FormInput,
  SubmitButton,
  PasswordStrength,
  AuthFooter,
  AuthLink,
} from "../../components/auth/AuthShared";

const schema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function MissingTokenState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 20,
        padding: "12px 0",
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
          Link not found
        </h2>
        <p
          style={{
            fontSize: "0.875rem",
            color: "#8a8179",
            lineHeight: 1.65,
            maxWidth: 300,
          }}
        >
          This reset link is invalid or has expired. Reset links are single-use
          and expire after 1 hour.
        </p>
      </div>
      <Link
        to="/forgot-password"
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

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { mutate: resetPassword, isPending, error } = useResetPassword();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const password = useWatch({ control, name: "password", defaultValue: "" });

  if (!token) {
    return (
      <AuthCard>
        <AuthBrand />
        <MissingTokenState />
      </AuthCard>
    );
  }

  const onSubmit = ({ password, confirmPassword }) => {
    resetPassword({ token, password, confirmPassword });
  };

  return (
    <AuthCard>
      <AuthBrand />

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
          Set a new password
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#8a8179", lineHeight: 1.6 }}>
          Choose something strong that you haven't used before.
        </p>
      </div>

      <AuthAlert message={error?.message} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <FormInput
            label="New password"
            id="rp-password"
            type="password"
            register={register("password")}
            error={errors.password?.message}
            placeholder="Min. 6 characters"
            autoComplete="new-password"
            required
          />
          <PasswordStrength password={password} />
        </div>

        <FormInput
          label="Confirm new password"
          id="rp-confirm"
          type="password"
          register={register("confirmPassword")}
          error={errors.confirmPassword?.message}
          placeholder="Repeat your new password"
          autoComplete="new-password"
          required
        />

        {/* Security notice */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: "0.78rem",
            color: "#166534",
          }}
        >
          <ShieldCheck size={14} style={{ flexShrink: 0, color: "#22c55e" }} />
          Your password is encrypted and never stored in plain text.
        </div>

        <SubmitButton
          isPending={isPending}
          label="Update password"
          loadingLabel="Updating…"
        />
      </form>

      <AuthFooter>
        <AuthLink to="/login">Back to login</AuthLink>
      </AuthFooter>
    </AuthCard>
  );
}
