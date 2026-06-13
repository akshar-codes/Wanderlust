import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "../hooks/useAuth";
import { loginSchema } from "../schemas";
import {
  AuthCard,
  AuthBrand,
  AuthAlert,
  FormInput,
  SubmitButton,
  AuthDivider,
  GoogleButton,
  AuthFooter,
  AuthLink,
} from "../components/auth/AuthShared";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const { mutate: login, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  return (
    <AuthCard>
      <AuthBrand />

      <p
        style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#ff5a5f",
          marginBottom: 2,
        }}
      >
        Welcome back
      </p>
      <h1
        style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: "clamp(1.6rem, 3vw, 1.9rem)",
          color: "#261f1a",
          lineHeight: 1.15,
          marginBottom: 2,
        }}
      >
        Sign in to continue
      </h1>
      <p style={{ fontSize: "0.9rem", color: "#8a8179", marginBottom: 16 }}>
        Your next adventure is waiting.
      </p>

      <AuthAlert message={error?.message} />

      <form
        onSubmit={handleSubmit((data) => login(data))}
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
          required
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <FormInput
            label="Password"
            id="password"
            type="password"
            register={register("password")}
            error={errors.password?.message}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Link
              to="/forgot-password"
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
        </div>

        <SubmitButton
          isPending={isPending}
          label="Log in"
          loadingLabel="Signing in…"
        />
      </form>

      <AuthDivider />
      <GoogleButton label="Continue with Google" />

      <AuthFooter>
        Don't have an account? <AuthLink to="/signup">Sign up</AuthLink>
      </AuthFooter>
    </AuthCard>
  );
}
