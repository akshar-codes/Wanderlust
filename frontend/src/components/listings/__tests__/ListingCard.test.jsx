import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ListingCard from "../ListingCard";

// Mock hooks
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock("../../hooks/useWishlist", () => ({
  useWishlistStatus: () => ({ data: null, isLoading: false }),
}));

const mockListing = {
  _id: "123",
  title: "Cozy Cabin",
  location: "Manali",
  country: "India",
  price: 5000,
  category: "mountains",
  averageRating: 4.5,
  reviewCount: 42,
  images: [{ url: "https://example.com/img.jpg" }],
};

describe("ListingCard", () => {
  const renderCard = (props = {}) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ListingCard listing={mockListing} {...props} />
        </BrowserRouter>
      </QueryClientProvider>,
    );
  };

  it("renders title, location, country, and price", () => {
    renderCard();
    expect(screen.getByText("Cozy Cabin")).toBeInTheDocument();
    expect(screen.getByText("Manali, India")).toBeInTheDocument();
    expect(screen.getByText("₹5,000")).toBeInTheDocument();
  });

  it("renders category badge by default", () => {
    renderCard();
    expect(screen.getByText("mountains")).toBeInTheDocument();
  });

  it("renders featured badge if variant is featured", () => {
    renderCard({ variant: "featured" });
    expect(screen.getByText(/Featured/i)).toBeInTheDocument();
  });

  it("renders link by default", () => {
    renderCard();
    const link = screen.getByRole("link", { name: /Cozy Cabin/i });
    expect(link).toHaveAttribute("href", "/listings/123");
  });

  it("renders noLink mode", () => {
    renderCard({ noLink: true });
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Cozy Cabin")).toBeInTheDocument();
  });

  it("shows tax when showTax is true", () => {
    renderCard({ showTax: true });
    expect(screen.getByText(/incl. 18% tax/i)).toBeInTheDocument();
    // 5000 * 1.18 = 5900
    expect(screen.getByText("₹5,900")).toBeInTheDocument();
  });
});
