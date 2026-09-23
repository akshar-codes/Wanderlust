import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { Modal, ConfirmModal, AlertModal } from "../Modal";

describe("Modal Components", () => {
  describe("Modal", () => {
    it("renders title and children", () => {
      render(
        <Modal open={true} onClose={() => {}} title="Test Modal">
          <div>Modal Content</div>
        </Modal>,
      );

      expect(screen.getByText("Test Modal")).toBeInTheDocument();
      expect(screen.getByText("Modal Content")).toBeInTheDocument();
    });

    it("calls onClose when X is clicked", async () => {
      const onClose = vi.fn();
      render(<Modal open={true} onClose={onClose} title="Test Modal" />);

      const closeBtn = screen.getByLabelText("Close dialog");
      await userEvent.click(closeBtn);

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("ConfirmModal", () => {
    it("renders buttons and calls onConfirm", async () => {
      const onConfirm = vi.fn();
      render(
        <ConfirmModal
          open={true}
          onConfirm={onConfirm}
          message="Are you sure?"
        />,
      );

      expect(screen.getAllByText("Are you sure?")[0]).toBeInTheDocument();

      const confirmBtn = screen.getByRole("button", { name: "Confirm" });
      await userEvent.click(confirmBtn);

      expect(onConfirm).toHaveBeenCalled();
    });

    it("disables buttons when loading", () => {
      render(<ConfirmModal open={true} loading={true} />);
      const buttons = screen.getAllByRole("button");
      buttons.forEach((btn) => expect(btn).toBeDisabled());
    });
  });

  describe("AlertModal", () => {
    it("renders severity message", () => {
      render(
        <AlertModal
          open={true}
          title="Warning!"
          message="Be careful"
          severity="warning"
        />,
      );
      expect(screen.getByText("Warning!")).toBeInTheDocument();
      expect(screen.getByText("Be careful")).toBeInTheDocument();
    });
  });
});
