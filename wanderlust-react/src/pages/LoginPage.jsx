import { Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schemas";
import { useLogin } from "../hooks/useAuth";
import { Compass } from "lucide-react";

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
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <Compass size={32} className="brand-icon" />
          <span>Wanderlust</span>
        </div>

        <h1 className="auth-card__title">Welcome back</h1>
        <p className="auth-card__subtitle">Sign in to continue exploring</p>

        {/* Server-side error */}
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
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
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
            {isPending ? "Signing in…" : "Log in"}
          </button>
        </form>

        <p className="auth-card__footer">
          Don't have an account?{" "}
          <Link
            to="/signup"
            state={location.state}
            className="link"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
