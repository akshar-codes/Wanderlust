import { useState } from "react";
import { useForm } from "react-hook-form";
import { useVerify2fa } from "../../hooks/useAuth";
import {
  AuthCard,
  AuthBrand,
  AuthAlert,
  FormInput,
  SubmitButton,
} from "../../components/auth/AuthShared";
import { Link } from "react-router-dom";

export default function TwoFactorChallengePage() {
  const [useRecovery, setUseRecovery] = useState(false);
  const { mutate: verify2fa, isPending, error } = useVerify2fa();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    if (useRecovery) {
      verify2fa({ recoveryCode: data.code });
    } else {
      verify2fa({ token: data.code });
    }
  };

  return (
    <AuthCard>
      <AuthBrand />

      <h1
        style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: "clamp(1.6rem, 3vw, 1.9rem)",
          color: "#261f1a",
          lineHeight: 1.15,
          marginBottom: 2,
        }}
      >
        Two-Factor Authentication
      </h1>
      <p style={{ fontSize: "0.9rem", color: "#8a8179", marginBottom: 16 }}>
        {useRecovery
          ? "Enter one of your recovery codes."
          : "Enter the 6-digit code from your authenticator app."}
      </p>

      <AuthAlert message={error?.message} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <FormInput
          id="code"
          label={useRecovery ? "Recovery Code" : "Authentication Code"}
          type="text"
          placeholder={useRecovery ? "XXXXX-XXXXX" : "000000"}
          error={errors.code?.message}
          register={register("code", { required: "This field is required" })}
        />

        <SubmitButton isSubmitting={isPending}>Verify</SubmitButton>
      </form>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <button
          type="button"
          onClick={() => setUseRecovery(!useRecovery)}
          style={{
            background: "none",
            border: "none",
            color: "#ff5a5f",
            cursor: "pointer",
            fontSize: "0.9rem",
            textDecoration: "underline",
          }}
        >
          {useRecovery
            ? "Use authenticator app instead"
            : "Use a recovery code"}
        </button>
      </div>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <Link
          to="/login"
          style={{
            color: "#8a8179",
            fontSize: "0.9rem",
            textDecoration: "none",
          }}
        >
          &larr; Back to login
        </Link>
      </div>
    </AuthCard>
  );
}
