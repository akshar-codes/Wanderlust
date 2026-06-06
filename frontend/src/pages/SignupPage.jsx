import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "../schemas";
import { useSignup } from "../hooks/useAuth";
import { Compass } from "lucide-react";

export default function SignupPage() {
  const { mutate: signup, isPending, error } = useSignup();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  const onSubmit = (data) => signup(data);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <Compass size={32} className="brand-icon" />
          <span>Wanderlust</span>
        </div>

        <h1 className="auth-card__title">Create your account</h1>
        <p className="auth-card__subtitle">Start your journey today</p>

        {error && (
          <div className="form-server-error" role="alert">
            {error.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              className={`form-input ${errors.username ? "form-input--error" : ""}`}
              {...register("username")}
            />
            {errors.username && <p className="form-error">{errors.username.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`form-input ${errors.email ? "form-input--error" : ""}`}
              {...register("email")}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className={`form-input ${errors.password ? "form-input--error" : ""}`}
              {...register("password")}
            />
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={isPending}
          >
            {isPending ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="auth-card__footer">
          Already have an account?{" "}
          <Link to="/login" className="link">Log in</Link>
        </p>
      </div>
    </div>
  );
}
