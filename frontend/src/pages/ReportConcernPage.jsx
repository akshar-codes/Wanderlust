import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useCreateReport } from "../hooks/useReports";
import { PageHeader } from "../components/layout/PageHeader";

const reasons = [
  "spam",
  "inappropriate",
  "fraud",
  "fake",
  "harassment",
  "other",
];

export default function ReportConcernPage() {
  const [targetType, setTargetType] = useState("listing");
  const [targetId, setTargetId] = useState("");
  const [reason, setReason] = useState("other");
  const [description, setDescription] = useState("");
  const { mutate, isPending, isSuccess } = useCreateReport();

  const submit = (event) => {
    event.preventDefault();
    mutate(
      {
        targetType,
        targetId: targetId.trim(),
        reason,
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          setTargetId("");
          setDescription("");
        },
      },
    );
  };

  return (
    <Box sx={{ maxWidth: 760, mx: "auto", px: { xs: 2, md: 4 }, pb: 8 }}>
      <PageHeader
        eyebrow="Support"
        title="Report a concern"
        subtitle="Send a listing, review, or user report to the Wanderlust moderation queue."
      />
      <Box component="form" onSubmit={submit} sx={{ display: "grid", gap: 2 }}>
        <Alert severity="info">
          You can find a listing ID at the end of its URL. Review and user IDs
          are available in the relevant content or profile details.
        </Alert>
        <TextField
          select
          label="What are you reporting?"
          value={targetType}
          onChange={(e) => setTargetType(e.target.value)}
        >
          <MenuItem value="listing">Listing</MenuItem>
          <MenuItem value="review">Review</MenuItem>
          <MenuItem value="user">User</MenuItem>
        </TextField>
        <TextField
          label="Item ID"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          required
          inputProps={{ maxLength: 100 }}
        />
        <TextField
          select
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          {reasons.map((item) => (
            <MenuItem key={item} value={item}>
              {item[0].toUpperCase() + item.slice(1)}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Additional details (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          minRows={3}
          inputProps={{ maxLength: 1000 }}
          helperText={`${description.length}/1000`}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={isPending || !targetId.trim()}
        >
          {isPending ? "Sending…" : "Submit report"}
        </Button>
        {isSuccess && (
          <Typography role="status" color="success.main">
            Your report was submitted for review.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
