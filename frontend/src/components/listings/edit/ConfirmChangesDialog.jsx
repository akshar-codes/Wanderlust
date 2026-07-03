import { Box, Stack, Typography } from "@mui/material";
import { ArrowRight } from "lucide-react";
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { neutral, semantic } from "../../../theme/tokens";

export default function ConfirmChangesDialog({
  open,
  onClose,
  changes,
  onConfirm,
  loading,
}) {
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      title="Review your changes"
      maxWidth="sm"
      actions={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm} loading={loading}>
            Confirm & save
          </Button>
        </>
      }
    >
      <Stack spacing={1.5} sx={{ pt: 1 }}>
        <Typography variant="body2" sx={{ color: neutral[500] }}>
          {changes.length} field{changes.length === 1 ? "" : "s"} will be
          updated on this listing.
        </Typography>

        {changes.map((c) => (
          <Box
            key={c.key}
            sx={{
              border: `1px solid ${neutral[200]}`,
              borderRadius: "12px",
              p: 1.5,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.8125rem",
                color: neutral[700],
                mb: 0.5,
              }}
            >
              {c.label}
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              flexWrap="wrap"
            >
              <Typography
                variant="body2"
                sx={{
                  color: semantic.error.text,
                  textDecoration: "line-through",
                  wordBreak: "break-word",
                }}
              >
                {String(c.oldValue ?? "").trim() || "—"}
              </Typography>
              <ArrowRight size={14} color={neutral[400]} />
              <Typography
                variant="body2"
                sx={{
                  color: semantic.success.text,
                  fontWeight: 600,
                  wordBreak: "break-word",
                }}
              >
                {String(c.newValue ?? "").trim() || "—"}
              </Typography>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Modal>
  );
}
