import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Input, Textarea } from "../Input";
import userEvent from "@testing-library/user-event";

describe("Input Component", () => {
  it("renders with label and placeholder", () => {
    render(<Input label="Username" placeholder="Enter username" />);
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter username")).toBeInTheDocument();
  });

  it("renders hint text", () => {
    render(<Input label="Username" hint="Must be unique" />);
    expect(screen.getByText("Must be unique")).toBeInTheDocument();
  });

  it("renders error state", () => {
    render(<Input label="Username" error="Required field" />);
    expect(screen.getByText("Required field")).toBeInTheDocument();
  });

  it("Textarea allows typing", async () => {
    const user = userEvent.setup();
    render(<Textarea label="Bio" />);
    const textarea = screen.getByLabelText("Bio");
    await user.type(textarea, "Hello world");
    expect(textarea).toHaveValue("Hello world");
  });
});
