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
            color: "var(--color-text)",
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
                bgcolor: i <= step ? brand[500] : "var(--color-border)",
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
                    bgcolor: isDone ? brand[500] : "var(--color-surface)",
                    color: isDone
                      ? "var(--color-surface)"
                      : isActive
                        ? brand[500]
                        : "var(--color-text-muted)",
                    border: `2px solid ${isDone || isActive ? brand[500] : "var(--color-border)"}`,
                  }}
                >
                  {isDone ? <Check size={16} /> : i + 1}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: isActive ? 700 : 500,
                    color: isActive
                      ? "var(--color-text)"
                      : "var(--color-text-secondary)",
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
                    bgcolor: isDone ? brand[500] : "var(--color-border)",
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
