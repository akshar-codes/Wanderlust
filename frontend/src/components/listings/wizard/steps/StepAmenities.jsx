import { Box, Typography } from "@mui/material";
import { Check } from "lucide-react";
import { AMENITY_GROUPS } from "../../../../schemas/listingWizard";
import { neutral, brand, radii } from "../../../../theme/tokens";

export default function StepAmenities({ selected, onChange }) {
  const toggle = (key) =>
    onChange(
      selected.includes(key)
        ? selected.filter((a) => a !== key)
        : [...selected, key],
    );

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
          What does your place offer?
        </Typography>
        <Typography variant="body2" sx={{ color: neutral[500] }}>
          You can always add more amenities later.
        </Typography>
      </Box>

      {AMENITY_GROUPS.map((group) => (
        <Box key={group.label}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "0.8125rem",
              color: neutral[600],
              mb: 1.25,
            }}
          >
            {group.label}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" },
              gap: 1,
            }}
          >
            {group.items.map(({ key, label, icon }) => {
              const active = selected.includes(key);
              return (
                <Box
                  key={key}
                  onClick={() => toggle(key)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: radii.lg,
                    cursor: "pointer",
                    border: `1.5px solid ${active ? brand[500] : neutral[200]}`,
                    bgcolor: active ? brand[50] : "#fff",
                    transition: "all 120ms",
                  }}
                >
                  <Typography sx={{ fontSize: "1.05rem" }}>{icon}</Typography>
                  <Typography
                    sx={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: active ? brand[700] : neutral[700],
                      flex: 1,
                    }}
                  >
                    {label}
                  </Typography>
                  {active && <Check size={14} color={brand[600]} />}
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
