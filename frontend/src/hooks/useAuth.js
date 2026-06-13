import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { authService } from "../services/auth.service";
import toast from "react-hot-toast";

// ── Login ─────────────────────────────────────────────────────────────────────
export function useLogin() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      toast.success("Welcome back!");
      const returnTo = location.state?.from || "/listings";
      navigate(returnTo, { replace: true });
    },
    onError: (err) =>
      toast.error(err.message || "Invalid username or password"),
  });
}

// ── Signup ────────────────────────────────────────────────────────────────────
export function useSignup() {
  const { signup } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: signup,
    onSuccess: () => {
      toast.success("Account created — check your inbox to verify your email.");
      const returnTo = location.state?.from || "/listings";
      navigate(returnTo, { replace: true });
    },
    onError: (err) =>
      toast.error(err.message || "Signup failed — please try again"),
  });
}

// ── Logout ────────────────────────────────────────────────────────────────────
export function useLogout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      qc.clear(); // nuke all cached queries on sign-out
      toast.success("Logged out successfully.");
      navigate("/login", { replace: true });
    },
    onError: (err) => toast.error(err.message),
  });
}

// ── Forgot Password ───────────────────────────────────────────────────────────
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email) => authService.forgotPassword(email),
    // Don't toast success — the page shows its own confirmation UI
    onError: (err) => toast.error(err.message || "Failed to send reset email"),
  });
}

// ── Reset Password ────────────────────────────────────────────────────────────
export function useResetPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload) => authService.resetPassword(payload),
    onSuccess: () => {
      toast.success("Password updated — please log in with your new password.");
      navigate("/login", { replace: true });
    },
    onError: (err) =>
      toast.error(
        err.message || "Failed to reset password — link may be expired",
      ),
  });
}

// ── Verify Email ──────────────────────────────────────────────────────────────
export function useVerifyEmail() {
  const { markEmailVerified, refreshUser } = useAuthStore();

  return useMutation({
    mutationFn: (token) => authService.verifyEmail(token),
    onSuccess: () => {
      markEmailVerified();
      refreshUser(); // sync full user from server
    },
    onError: (err) => {
      // page handles its own error UI, no toast here
      console.error("[verifyEmail]", err.message);
    },
  });
}

// ── Resend Verification ───────────────────────────────────────────────────────
export function useResendVerification() {
  return useMutation({
    mutationFn: () => authService.resendVerification(),
    onSuccess: () =>
      toast.success("Verification email sent — check your inbox."),
    onError: (err) =>
      toast.error(err.message || "Failed to resend — please try again later"),
  });
}
