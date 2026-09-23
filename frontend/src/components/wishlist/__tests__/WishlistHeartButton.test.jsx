import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import WishlistHeartButton from "../WishlistHeartButton";
import { useAuthStore } from "../../../store/auth.store";
import { useWishlistStatus } from "../../../hooks/useWishlist";
import toast from "react-hot-toast";

vi.mock("../../../store/auth.store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("../../../hooks/useWishlist", () => ({
  useWishlistStatus: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn() },
}));

// Mock CollectionPickerMenu
vi.mock("../CollectionPickerMenu", () => ({
  default: ({ open }) =>
    open ? <div data-testid="collection-menu">Menu Open</div> : null,
}));

describe("WishlistHeartButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows toast when unauthenticated and clicked", async () => {
    useAuthStore.mockReturnValue({ isAuthenticated: false });
    useWishlistStatus.mockReturnValue({ data: null, isLoading: false });

    render(<WishlistHeartButton listingId="123" />);

    const button = screen.getByRole("button", { name: /Save to wishlist/i });
    await userEvent.click(button);

    expect(toast.error).toHaveBeenCalledWith(
      "Log in to save listings to your wishlist",
    );
  });

  it("opens menu when authenticated and clicked", async () => {
    useAuthStore.mockReturnValue({ isAuthenticated: true });
    useWishlistStatus.mockReturnValue({
      data: { wishlisted: false },
      isLoading: false,
    });

    render(<WishlistHeartButton listingId="123" />);

    const button = screen.getByRole("button", { name: /Save to wishlist/i });
    await userEvent.click(button);

    expect(screen.getByTestId("collection-menu")).toBeInTheDocument();
  });

  it("renders pill variant", () => {
    useAuthStore.mockReturnValue({ isAuthenticated: true });
    useWishlistStatus.mockReturnValue({
      data: { wishlisted: true },
      isLoading: false,
    });

    render(<WishlistHeartButton listingId="123" variant="pill" />);

    expect(
      screen.getByRole("button", { name: /Manage wishlist/i }),
    ).toHaveTextContent("Saved");
  });
});
