import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton as MuiIconButton,
  Alert,
  Slide,
} from "@mui/material";
import { X } from "lucide-react";
import { forwardRef } from "react";
import { Button, LoadingButton } from "./Button";
import { colors, radii, shadows } from "../../theme/tokens";

// Slide-up transition for the dialog
const SlideUp = forwardRef(function SlideUp(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// ── Modal ─────────────────────────────────────────────────────────────────────

export function Modal({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = true,
  hideClose = false,
  noPadding = false,
  sx,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      TransitionComponent={SlideUp}
      sx={sx}
    >
      {/* Title row */}
      {(title || !hideClose) && (
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pr: hideClose ? undefined : 1.5,
          }}
        >
          {title}
          {!hideClose && (
            <MuiIconButton
              onClick={onClose}
              aria-label="Close dialog"
              size="small"
              sx={{
                color: colors.neutral[500],
                "&:hover": {
                  background: colors.neutral[100],
                  color: colors.neutral[700],
                },
              }}
            >
              <X size={18} />
            </MuiIconButton>
          )}
        </DialogTitle>
      )}

      {/* Content */}
      <DialogContent
        sx={
          noPadding
            ? { padding: 0, "&:first-of-type": { paddingTop: 0 } }
            : undefined
        }
      >
        {children}
      </DialogContent>

      {/* Footer actions */}
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  confirmVariant = "primary",
  cancelLabel = "Cancel",
  loading = false,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      TransitionComponent={SlideUp}
    >
      <DialogTitle>{title}</DialogTitle>

      {message && (
        <DialogContent>
          <p
            style={{
              fontSize: "0.9rem",
              color: colors.neutral[600],
              lineHeight: 1.6,
            }}
          >
            {message}
          </p>
        </DialogContent>
      )}

      <DialogActions>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <LoadingButton
          variant={confirmVariant}
          loading={loading}
          onClick={onConfirm}
        >
          {confirmLabel}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

// ── Alert Modal ───────────────────────────────────────────────────────────────

export function AlertModal({
  open,
  onClose,
  severity = "info",
  title,
  message,
  actionLabel = "OK",
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      TransitionComponent={SlideUp}
    >
      <DialogContent sx={{ pt: 3 }}>
        <Alert
          severity={severity}
          sx={{
            borderRadius: radii.lg,
            fontSize: "0.875rem",
            border: "1px solid transparent",
            "& .MuiAlert-message": { width: "100%" },
          }}
        >
          {title && (
            <p style={{ fontWeight: 700, marginBottom: message ? 4 : 0 }}>
              {title}
            </p>
          )}
          {message && <p>{message}</p>}
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button variant="primary" onClick={onClose} size="sm">
          {actionLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default Modal;
