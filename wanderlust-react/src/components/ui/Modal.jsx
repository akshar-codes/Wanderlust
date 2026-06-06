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
import { colors, radii } from "../../theme/tokens";

// Slide-up transition for the dialog
const SlideUp = forwardRef(function SlideUp(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// ── Modal ─────────────────────────────────────────────────────────────────────
/**
 * @param {boolean}       open
 * @param {Function}      onClose
 * @param {string}        title
 * @param {React.ReactNode} children
 * @param {React.ReactNode} actions    — rendered in DialogActions
 * @param {"xs"|"sm"|"md"|"lg"|"xl"} maxWidth
 * @param {boolean}       fullWidth
 * @param {boolean}       hideClose    — hides the ✕ button in the header
 * @param {boolean}       noPadding    — removes content padding
 */
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
                "&:hover": { background: colors.neutral[100] },
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
/**
 * @param {string}   title
 * @param {string}   message
 * @param {string}   confirmLabel
 * @param {"primary"|"danger"} confirmVariant
 * @param {string}   cancelLabel
 * @param {boolean}  loading
 * @param {Function} onConfirm
 * @param {Function} onClose
 */
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
/**
 * @param {"success"|"info"|"warning"|"error"} severity
 * @param {string}  title
 * @param {string}  message
 * @param {string}  actionLabel
 */
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
