import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { Cloud, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../ui/Button";
import { neutral, brand, radii, shadows } from "../../../theme/tokens";
import WizardProgress from "./WizardProgress";
import { WIZARD_STEPS } from "../../../store/listingWizard.store";

function timeAgo(ts) {
  if (!ts) return null;
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 5) return "Saved just now";
  if (secs < 60) return `Saved ${secs}s ago`;
  const mins = Math.floor(secs / 60);
  return `Saved ${mins}m ago`;
}

function AutosaveIndicator({ lastSavedAt }) {
  const [, forceTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceTick((t) => t + 1), 10000);
    return () => clearInterval(id);
  }, []);
  if (!lastSavedAt) return null;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        color: neutral[400],
      }}
    >
      <Cloud size={14} />
      <Typography variant="caption">{timeAgo(lastSavedAt)}</Typography>
    </Box>
  );
}

export default function WizardShell({
  step,
  maxReachedStep,
  onStepClick,
  lastSavedAt,
  onBack,
  onNext,
  nextLabel = "Next",
  nextDisabled = false,
  nextLoading = false,
  hideNext = false,
  children,
}) {
  return (
    <Box
      sx={{
        maxWidth: 760,
        mx: "auto",
        px: { xs: 2, md: 3 },
        pb: { xs: 14, md: 8 },
        pt: { xs: 3, md: 6 },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography
          component={Link}
          to="/listings"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            color: neutral[500],
            fontSize: "0.875rem",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <X size={16} /> Exit
        </Typography>
        <AutosaveIndicator lastSavedAt={lastSavedAt} />
      </Box>

      <WizardProgress
        step={step}
        maxReachedStep={maxReachedStep}
        onStepClick={onStepClick}
      />

      {/* Step content */}
      <Box
        sx={{
          bgcolor: "#fff",
          border: `1px solid ${neutral[200]}`,
          borderRadius: radii["2xl"],
          boxShadow: shadows.card,
          p: { xs: 2.5, md: 5 },
          minHeight: 360,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={WIZARD_STEPS[step].key}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Footer nav — sticky on mobile */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mt: { xs: 0, md: 4 },
          position: { xs: "fixed", md: "static" },
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: { xs: "rgba(255,255,255,0.97)", md: "transparent" },
          backdropFilter: { xs: "blur(12px)", md: "none" },
          borderTop: { xs: `1px solid ${neutral[200]}`, md: "none" },
          px: { xs: 2.5, md: 0 },
          py: { xs: 2, md: 0 },
          zIndex: 50,
        }}
      >
        <Button variant="ghost" onClick={onBack} disabled={step === 0}>
          Back
        </Button>
        {!hideNext && (
          <Button
            variant="primary"
            onClick={onNext}
            disabled={nextDisabled}
            loading={nextLoading}
          >
            {nextLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
}
