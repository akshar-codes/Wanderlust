import { Box, Stack, Typography } from "@mui/material";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { brand, neutral } from "../../../theme/tokens";
import { WIZARD_STEPS } from "../../../store/listingWizard.store";

export default function WizardProgress({ step, maxReachedStep, onStepClick }) {
  return (
    <Box sx={{ mb: { xs: 3, md: 5 } }}>
      {/* Mobile: compact bar */}
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <Typography variant="overline" sx={{ color: brand[600] }}>
          Step {step + 1} of {WIZARD_STEPS.length}
        </Typography>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "1.05rem",
            color: neutral[800],
            mb: 1,
          }}
        >
          {WIZARD_STEPS[step].label}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {WIZARD_STEPS.map((s, i) => (
            <Box
              key={s.key}
              sx={{
                flex: 1,
                height: 4,
                borderRadius: 999,
                bgcolor: i <= step ? brand[500] : neutral[200],
                transition: "background-color 200ms",
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Desktop: full stepper */}
      <Stack
        direction="row"
        alignItems="flex-start"
        sx={{ display: { xs: "none", md: "flex" } }}
      >
        {WIZARD_STEPS.map((s, i) => {
          const isDone = i < step;
          const isActive = i === step;
          const isClickable = i <= maxReachedStep;
          return (
            <Box
              key={s.key}
              sx={{
                display: "flex",
                alignItems: "center",
                flex: i < WIZARD_STEPS.length - 1 ? 1 : "0 0 auto",
              }}
            >
              <Stack
                alignItems="center"
                spacing={0.75}
                onClick={() => isClickable && onStepClick(i)}
                sx={{
                  cursor: isClickable ? "pointer" : "default",
                  minWidth: 88,
                }}
              >
                <Box
                  component={motion.div}
                  animate={{ scale: isActive ? 1.08 : 1 }}
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    bgcolor: isDone ? brand[500] : "#fff",
                    color: isDone
                      ? "#fff"
                      : isActive
                        ? brand[500]
                        : neutral[400],
                    border: `2px solid ${isDone || isActive ? brand[500] : neutral[200]}`,
                  }}
                >
                  {isDone ? <Check size={16} /> : i + 1}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? neutral[800] : neutral[500],
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.label}
                </Typography>
              </Stack>
              {i < WIZARD_STEPS.length - 1 && (
                <Box
                  sx={{
                    flex: 1,
                    height: 2,
                    bgcolor: isDone ? brand[500] : neutral[200],
                    mx: 1,
                    mt: -2.5,
                  }}
                />
              )}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
