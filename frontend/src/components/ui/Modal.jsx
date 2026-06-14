import { forwardRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton as MuiIconButton,
  Alert,
  Slide,
  Drawer as MuiDrawer,
  Divider,
  Box,
  Typography,
} from "@mui/material";
import { Button } from "./Button";
import { brand, neutral, semantic, fonts, radii } from "../../theme/tokens";

// Slide-up transition
const SlideUp = forwardRef(function SlideUp(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// ─── X icon ───────────────────────────────────────────────────────────────────
function XIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/**
 * Modal — general-purpose dialog
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
  sx,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      TransitionComponent={SlideUp}
      aria-labelledby={title ? "wl-modal-title" : undefined}
      sx={sx}
    >
      {(title || !hideClose) && (
        <DialogTitle
          id="wl-modal-title"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pr: hideClose ? undefined : 1.5,
            gap: 1,
          }}
        >
          <span>{title}</span>
          {!hideClose && (
            <MuiIconButton
              onClick={onClose}
              aria-label="Close dialog"
              size="small"
              sx={{
                color: neutral[500],
                borderRadius: "8px",
                "&:hover": { background: neutral[100], color: neutral[700] },
              }}
            >
              <XIcon />
            </MuiIconButton>
          )}
        </DialogTitle>
      )}
      <DialogContent>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
}

/**
 * ConfirmModal — destructive or confirming action
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
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      TransitionComponent={SlideUp}
      aria-labelledby="wl-confirm-title"
    >
      <DialogTitle id="wl-confirm-title">{title}</DialogTitle>
      {message && (
        <DialogContent>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ lineHeight: 1.65 }}
          >
            {message}
          </Typography>
        </DialogContent>
      )}
      <DialogActions>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * AlertModal — informational / status alert
 */
export function AlertModal({
  open,
  onClose,
  severity = "info",
  title,
  message,
  actionLabel = "Got it",
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
            "& .MuiAlert-message": { width: "100%" },
          }}
        >
          {title && (
            <Typography sx={{ fontWeight: 700, mb: message ? 0.5 : 0 }}>
              {title}
            </Typography>
          )}
          {message && <Typography variant="body2">{message}</Typography>}
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

/**
 * Drawer — slide-in panel (right by default)
 */
export function Drawer({
  open,
  onClose,
  anchor = "right",
  title,
  subtitle,
  width = 380,
  children,
  footer,
}) {
  return (
    <MuiDrawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width:
            anchor === "left" || anchor === "right"
              ? `min(${width}px, 92vw)`
              : undefined,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          px: 3,
          py: 2.5,
          borderBottom: `1px solid`,
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Box>
          {title && (
            <Typography
              sx={{
                fontFamily: fonts.display,
                fontSize: "1.25rem",
                color: neutral[800],
                lineHeight: 1.2,
              }}
            >
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.25, display: "block" }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        <MuiIconButton
          onClick={onClose}
          aria-label="Close drawer"
          size="small"
          sx={{
            color: neutral[500],
            borderRadius: "8px",
            flexShrink: 0,
            "&:hover": { background: neutral[100] },
          }}
        >
          <XIcon />
        </MuiIconButton>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 3 }}>{children}</Box>

      {/* Footer */}
      {footer && (
        <>
          <Divider />
          <Box sx={{ px: 3, py: 2.5, flexShrink: 0 }}>{footer}</Box>
        </>
      )}
    </MuiDrawer>
  );
}

export default Modal;
