import { useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import toast from "react-hot-toast";

export function useLogin() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      toast.success("Welcome back!");
      // Redirect to the page they were trying to reach, or /listings
      const returnTo = location.state?.from || "/listings";
      navigate(returnTo, { replace: true });
    },
    onError: (err) => toast.error(err.message || "Invalid credentials"),
  });
}

export function useSignup() {
  const { signup } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: signup,
    onSuccess: () => {
      toast.success("Welcome to Wanderlust!");
      const returnTo = location.state?.from || "/listings";
      navigate(returnTo, { replace: true });
    },
    onError: (err) => toast.error(err.message || "Signup failed"),
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast.success("Logged out successfully.");
      navigate("/listings", { replace: true });
    },
    onError: (err) => toast.error(err.message),
  });
}
