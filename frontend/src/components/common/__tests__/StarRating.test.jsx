import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StarRating from "../StarRating";

describe("StarRating", () => {
  it("renders 5 stars by default", () => {
    const { container } = render(<StarRating rating={3} />);
    // Check if there are 5 svg elements
    const svgs = container.querySelectorAll("svg");
    expect(svgs).toHaveLength(5);
  });

  it("has proper aria-label", () => {
    render(<StarRating rating={4} max={5} />);
    expect(screen.getByLabelText("Rated 4 out of 5 stars")).toBeInTheDocument();
  });
});
