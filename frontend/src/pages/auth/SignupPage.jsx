import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignup } from "../hooks/useAuth";
import { signupSchema } from "../schemas";
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
  PasswordStrength,
} from "../components/auth/AuthShared";
import { Link } from "react-router-dom";
import { useWatch } from "react-hook-form";

function SignupForm() {
  const { mutate: signup, isPending, error } = useSignup();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  const password = useWatch({ control, name: "password", defaultValue: "" });

  return (
    <form
      onSubmit={handleSubmit((data) => signup(data))}
      noValidate
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <AuthAlert message={error?.message} />

      <FormInput
        label="Username"
        id="su-username"
        register={register("username")}
        error={errors.username?.message}
        placeholder="choose_a_username"
        autoComplete="username"
        required
        hint="3–30 characters, letters and numbers only"
      />
      <FormInput
        label="Email address"
        id="su-email"
        type="email"
        register={register("email")}
        error={errors.email?.message}
        placeholder="you@example.com"
        autoComplete="email"
        required
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <FormInput
          label="Password"
          id="su-password"
          type="password"
          register={register("password")}
          error={errors.password?.message}
          placeholder="Min. 6 characters"
          autoComplete="new-password"
          required
        />
        <PasswordStrength password={password} />
      </div>

      <p
        style={{
          fontSize: "0.75rem",
          color: "#b8b0a8",
          lineHeight: 1.55,
        }}
      >
        By signing up you agree to our{" "}
        <Link
          to="/terms"
          style={{ color: "#ff5a5f", fontWeight: 600, textDecoration: "none" }}
        >
          Terms
        </Link>{" "}
        and{" "}
        <Link
          to="/privacy"
          style={{ color: "#ff5a5f", fontWeight: 600, textDecoration: "none" }}
        >
          Privacy Policy
        </Link>
        .
      </p>

      <SubmitButton
        isPending={isPending}
        label="Create account"
        loadingLabel="Creating account…"
      />
    </form>
  );
}

export default function SignupPage() {
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
        Join the community
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
        Create your account
      </h1>
      <p style={{ fontSize: "0.9rem", color: "#8a8179", marginBottom: 16 }}>
        Start your journey with Wanderlust today.
      </p>

      <SignupForm />

      <AuthDivider />
      <GoogleButton label="Sign up with Google" />

      <AuthFooter>
        Already have an account? <AuthLink to="/login">Log in</AuthLink>
      </AuthFooter>
    </AuthCard>
  );
}
