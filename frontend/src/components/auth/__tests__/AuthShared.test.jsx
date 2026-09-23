import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthAlert, AuthSuccess, PasswordStrength } from "../AuthShared";

describe("AuthShared", () => {
  it("AuthAlert renders message", () => {
    render(<AuthAlert message="Invalid credentials" />);
    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  it("AuthSuccess renders message", () => {
    render(<AuthSuccess message="Check your email" />);
    expect(screen.getByText("Check your email")).toBeInTheDocument();
  });

  it("PasswordStrength returns correct strength", () => {
    const { rerender } = render(<PasswordStrength password="weak" />);
    expect(screen.getByText(/Password strength: Weak/i)).toBeInTheDocument();

    rerender(<PasswordStrength password="StrongP@ssw0rd!" />);
    expect(screen.getByText(/Password strength: Strong/i)).toBeInTheDocument();
  });
});
