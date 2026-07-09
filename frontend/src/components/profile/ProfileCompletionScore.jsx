import { Box, Typography, LinearProgress } from "@mui/material";
import { Check, Circle } from "lucide-react";
import { Card } from "../ui/Card";
import { brand, neutral, semantic, radii } from "../../theme/tokens";

const CHECKLIST = [
  { key: "firstName", label: "Add your first name" },
  { key: "lastName", label: "Add your last name" },
  { key: "bio", label: "Write a short bio" },
  { key: "phoneNumber", label: "Add a phone number" },
  { key: "avatar", label: "Upload a profile photo" },
  { key: "emailVerified", label: "Verify your email address" },
];

/**
 * ProfileCompletionScore — only rendered for the profile owner
 * (profileCompletion is stripped from the public-profile API shape).
 */
export default function ProfileCompletionScore({ user }) {
  if (user?.profileCompletion == null) return null;
  if (user.profileCompletion >= 100) return null;

  const pct = user.profileCompletion;
  const missing = CHECKLIST.filter((item) => !user[item.key]);

  const color =
    pct >= 75
      ? semantic.success.base
      : pct >= 40
        ? semantic.warning.base
        : semantic.error.base;

  return (
    <Card variant="raised">
      <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Typography
            sx={{ fontWeight: 700, fontSize: "0.9375rem", color: neutral[800] }}
          >
            Complete your profile
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: "1.0625rem", color }}>
            {pct}%
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{
            height: 8,
            borderRadius: radii.full,
            bgcolor: neutral[100],
            mb: 2,
            "& .MuiLinearProgress-bar": {
              bgcolor: color,
              borderRadius: radii.full,
            },
          }}
        />

        {missing.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {missing.map((item) => (
              <Box
                key={item.key}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Circle size={6} fill={neutral[300]} stroke="none" />
                <Typography variant="body2" sx={{ color: neutral[600] }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {missing.length === 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Check size={14} color={brand[600]} />
            <Typography variant="body2" sx={{ color: neutral[600] }}>
              Almost there — just a few small details left.
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
}
