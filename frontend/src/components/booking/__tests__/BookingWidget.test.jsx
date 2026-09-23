import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import BookingWidget from "../BookingWidget";
import { useAuthStore } from "../../../store/auth.store";
import { useIsOwner } from "../../../hooks/useCurrentUser";
import { useCreateBooking } from "../../../hooks/useBookings";
import toast from "react-hot-toast";

vi.mock("../../../store/auth.store", () => {
  const store = vi.fn();
  store.getState = vi.fn(() => ({ user: null }));
  return { useAuthStore: store };
});

vi.mock("../../../hooks/useCurrentUser", () => ({
  useIsOwner: vi.fn(),
}));

vi.mock("../../../hooks/useBookings", () => ({
  useCreateBooking: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn() },
}));

vi.mock("../AvailabilityCalendar", () => ({
  default: ({ onChange }) => (
    <button
      onClick={() => onChange(new Date(), new Date(Date.now() + 86400000 * 2))}
    >
      Mock Calendar
    </button>
  ),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: "/listings/123" }),
  };
});

describe("BookingWidget", () => {
  const mockListing = {
    _id: "123",
    price: 1000,
    owner: "owner123",
    maxGuests: 4,
    minimumStay: 1,
    availabilityCalendar: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows nightly price", () => {
    useAuthStore.mockReturnValue({ isAuthenticated: true });
    useIsOwner.mockReturnValue(false);
    useCreateBooking.mockReturnValue({ mutate: vi.fn(), isPending: false });

    render(
      <BrowserRouter>
        <BookingWidget listing={mockListing} />
      </BrowserRouter>,
    );

    expect(screen.getByText("₹1,000")).toBeInTheDocument();
  });

  it("shows error for owner", () => {
    useAuthStore.mockReturnValue({ isAuthenticated: true });
    useIsOwner.mockReturnValue(true);
    useCreateBooking.mockReturnValue({ mutate: vi.fn(), isPending: false });

    render(
      <BrowserRouter>
        <BookingWidget listing={mockListing} />
      </BrowserRouter>,
    );

    expect(
      screen.getByText(/You can't book your own listing/i),
    ).toBeInTheDocument();
  });

  it("shows toast when unauthenticated user tries to book", async () => {
    useAuthStore.mockReturnValue({ isAuthenticated: false });
    useIsOwner.mockReturnValue(false);
    useCreateBooking.mockReturnValue({ mutate: vi.fn(), isPending: false });

    render(
      <BrowserRouter>
        <BookingWidget listing={mockListing} />
      </BrowserRouter>,
    );

    const trigger = screen.getByText("Check-in — Check-out");
    await userEvent.click(trigger);

    const mockCal = screen.getByRole("button", { name: "Mock Calendar" });
    await userEvent.click(mockCal);

    const btn = screen.getByRole("button", { name: /Log in to reserve/i });
    await userEvent.click(btn);

    expect(toast.error).toHaveBeenCalledWith("Log in to book this stay");
  });
});
