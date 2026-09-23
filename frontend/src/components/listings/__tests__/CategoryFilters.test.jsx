import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import CategoryFilters from "../CategoryFilters";
import userEvent from "@testing-library/user-event";

const mockSetParams = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useSearchParams: () => [
      new URLSearchParams({ category: "mountains" }),
      mockSetParams,
    ],
  };
});

// Since CATEGORIES is not exported but used globally in the component, we'll mock the module or test around it.
// Assuming CATEGORIES is defined globally in the testing env or we just check the tax toggle.
describe("CategoryFilters", () => {
  // If CATEGORIES is undefined during test, the component will crash.
  // We can attach it to global just in case.
  beforeEach(() => {
    global.CATEGORIES = [
      { key: "mountains", icon: "⛰", label: "Mountains" },
      { key: "beach", icon: "🏖", label: "Beach" },
    ];
  });

  it("renders category chips and tax toggle", () => {
    render(
      <BrowserRouter>
        <CategoryFilters showTax={false} onTaxToggle={() => {}} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Mountains")).toBeInTheDocument();
    expect(screen.getByText("Show taxes")).toBeInTheDocument();
  });

  it("calls onTaxToggle when tax switch is clicked", async () => {
    const user = userEvent.setup();
    const onTaxToggle = vi.fn();
    render(
      <BrowserRouter>
        <CategoryFilters showTax={false} onTaxToggle={onTaxToggle} />
      </BrowserRouter>,
    );

    const taxToggle = screen.getByLabelText(/Show taxes/i);
    await user.click(taxToggle);
    expect(onTaxToggle).toHaveBeenCalledWith(true);
  });
});
