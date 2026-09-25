import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
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

describe("CategoryFilters", () => {

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
