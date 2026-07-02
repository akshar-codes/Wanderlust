import { Box, Typography, Stack } from "@mui/material";
import { Edit2, MapPin, Image as ImageIcon, Tag } from "lucide-react";
import { Button } from "../../../ui/Button";
import { neutral, brand, radii } from "../../../../theme/tokens";
import { WIZARD_STEPS } from "../../../../store/listingWizard.store";

function SummaryRow({ icon, label, value, onEdit }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 2,
        py: 1.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 1.25,
          alignItems: "flex-start",
          minWidth: 0,
        }}
      >
        <Box sx={{ color: neutral[400], mt: 0.25 }}>{icon}</Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="caption"
            sx={{
              color: neutral[500],
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              fontSize: "0.9375rem",
              color: neutral[800],
              wordBreak: "break-word",
            }}
          >
            {value}
          </Typography>
        </Box>
      </Box>
      <Box
        onClick={onEdit}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          color: brand[600],
          fontSize: "0.8125rem",
          fontWeight: 600,
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <Edit2 size={13} /> Edit
      </Box>
    </Box>
  );
}

export default function StepPublish({
  data,
  images,
  onEditStep,
  onSubmit,
  submitting,
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography
          sx={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "1.5rem",
            color: neutral[800],
            mb: 0.5,
          }}
        >
          Review & publish
        </Typography>
        <Typography variant="body2" sx={{ color: neutral[500] }}>
          Take one last look before it goes live.
        </Typography>
      </Box>

      {images[0] && (
        <Box
          sx={{
            borderRadius: radii.xl,
            overflow: "hidden",
            aspectRatio: "16/9",
          }}
        >
          <img
            src={images[0].previewUrl}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>
      )}

      <Box
        sx={{
          border: `1px solid ${neutral[200]}`,
          borderRadius: radii.xl,
          px: 2.5,
          divider: "1px",
        }}
      >
        <SummaryRow
          icon={<Tag size={16} />}
          label="Basics"
          value={`${data.title || "Untitled"} · ${data.category} · ${data.maxGuests} guests, ${data.bedrooms} bed(s)`}
          onEdit={() => onEditStep(0)}
        />
        <Box sx={{ height: 1, bgcolor: neutral[100] }} />
        <SummaryRow
          icon={<MapPin size={16} />}
          label="Location"
          value={`${data.location || "—"}, ${data.country || "—"}`}
          onEdit={() => onEditStep(1)}
        />
        <Box sx={{ height: 1, bgcolor: neutral[100] }} />
        <SummaryRow
          icon={<ImageIcon size={16} />}
          label="Photos"
          value={`${images.length} photo${images.length === 1 ? "" : "s"} uploaded`}
          onEdit={() => onEditStep(2)}
        />
        <Box sx={{ height: 1, bgcolor: neutral[100] }} />
        <SummaryRow
          icon={<Tag size={16} />}
          label="Pricing"
          value={`₹${Number(data.price || 0).toLocaleString("en-IN")} / night`}
          onEdit={() => onEditStep(4)}
        />
      </Box>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <Button
          variant="outline"
          fullWidth
          onClick={() => onSubmit(true)}
          loading={submitting === "draft"}
          disabled={!!submitting}
        >
          Save as draft
        </Button>
        <Button
          variant="primary"
          fullWidth
          onClick={() => onSubmit(false)}
          loading={submitting === "publish"}
          disabled={!!submitting}
        >
          Publish listing
        </Button>
      </Stack>
    </Box>
  );
}
