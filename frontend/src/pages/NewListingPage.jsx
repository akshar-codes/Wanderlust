import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Box, Typography, Stack } from "@mui/material";
import { Button } from "../components/ui/Button";
import WizardShell from "../components/listings/wizard/WizardShell";
import StepBasicDetails from "../components/listings/wizard/steps/StepBasicDetails";
import StepLocation from "../components/listings/wizard/steps/StepLocation";
import StepImages from "../components/listings/wizard/steps/StepImages";
import StepAmenities from "../components/listings/wizard/steps/StepAmenities";
import StepPricing from "../components/listings/wizard/steps/StepPricing";
import StepPublish from "../components/listings/wizard/steps/StepPublish";
import {
  useListingWizardStore,
  WIZARD_STEPS,
} from "../store/listingWizard.store";
import { useCreateListing } from "../hooks/useListings";
import { listingsService } from "../services/listings.service";
import { neutral } from "../theme/tokens";

export default function NewListingPage() {
  const navigate = useNavigate();
  const {
    step,
    maxReachedStep,
    data,
    images,
    lastSavedAt,
    setStep,
    nextStep,
    prevStep,
    updateData,
    setImages,
    resetWizard,
    hasDraft,
  } = useListingWizardStore();

  const [showResumeBanner, setShowResumeBanner] = useState(() => hasDraft());
  const [submitting, setSubmitting] = useState(null); // "draft" | "publish" | null
  const stepRef = useRef(null);
  const { mutateAsync: createListing } = useCreateListing();

  const goToStep = (i) => setStep(i);

  const handleNext = async () => {
    if (stepRef.current?.submit) {
      const ok = await stepRef.current.submit();
      if (!ok) return;
    }
    nextStep();
  };

  const handleFinalSubmit = async (asDraft) => {
    if (images.length === 0) {
      toast.error("Please add at least one photo before publishing.");
      setStep(2);
      return;
    }
    setSubmitting(asDraft ? "draft" : "publish");
    try {
      const fd = new FormData();
      fd.append("listing[title]", data.title);
      fd.append("listing[description]", data.description);
      if (data.shortDescription)
        fd.append("listing[shortDescription]", data.shortDescription);
      fd.append("listing[category]", data.category);
      fd.append("listing[propertyType]", data.propertyType || "other");
      fd.append("listing[location]", data.location);
      fd.append("listing[country]", data.country);
      fd.append("listing[price]", String(data.price));
      fd.append("listing[pricing][nightlyPrice]", String(data.price));
      fd.append("listing[pricing][cleaningFee]", String(data.cleaningFee || 0));
      fd.append("listing[pricing][serviceFee]", String(data.serviceFee || 0));
      fd.append("listing[pricing][taxes]", String(data.taxes || 0));
      fd.append("listing[bedrooms]", String(data.bedrooms));
      fd.append("listing[bathrooms]", String(data.bathrooms));
      fd.append("listing[beds]", String(data.beds));
      fd.append("listing[maxGuests]", String(data.maxGuests));
      fd.append("listing[minimumStay]", String(data.minimumStay));
      if (data.maximumStay)
        fd.append("listing[maximumStay]", String(data.maximumStay));
      data.amenities.forEach((a) => fd.append("listing[amenities][]", a));
      fd.append("listing[draft]", String(asDraft));
      fd.append("listing[image]", images[0].file);

      const listing = await createListing(fd);

      // Additional photos beyond the primary cover image
      if (images.length > 1) {
        await listingsService.addImages(
          listing._id,
          images.slice(1).map((i) => i.file),
        );
      }

      resetWizard();
      toast.success(asDraft ? "Draft saved." : "Listing published!");
      navigate(`/listings/${listing._id}`);
    } catch (err) {
      toast.error(
        err.message || "Something went wrong publishing your listing.",
      );
    } finally {
      setSubmitting(null);
    }
  };

  const renderStep = () => {
    switch (WIZARD_STEPS[step].key) {
      case "basics":
        return (
          <StepBasicDetails
            ref={stepRef}
            defaultValues={data}
            onValid={updateData}
          />
        );
      case "location":
        return (
          <StepLocation
            ref={stepRef}
            defaultValues={data}
            onValid={updateData}
          />
        );
      case "images":
        return <StepImages images={images} setImages={setImages} />;
      case "amenities":
        return (
          <StepAmenities
            selected={data.amenities}
            onChange={(amenities) => updateData({ amenities })}
          />
        );
      case "pricing":
        return (
          <StepPricing
            ref={stepRef}
            defaultValues={data}
            onValid={updateData}
          />
        );
      case "publish":
        return (
          <StepPublish
            data={data}
            images={images}
            onEditStep={goToStep}
            onSubmit={handleFinalSubmit}
            submitting={submitting}
          />
        );
      default:
        return null;
    }
  };

  if (showResumeBanner) {
    return (
      <Box
        sx={{
          maxWidth: 480,
          mx: "auto",
          mt: { xs: 6, md: 12 },
          textAlign: "center",
          px: 3,
        }}
      >
        <Typography
          sx={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "1.75rem",
            color: neutral[800],
            mb: 1,
          }}
        >
          Continue your draft?
        </Typography>
        <Typography variant="body2" sx={{ color: neutral[500], mb: 4 }}>
          You have an unfinished listing — "{data.title || "Untitled listing"}".
          Pick up where you left off, or start fresh.
        </Typography>
        <Stack direction="row" spacing={1.5} justifyContent="center">
          <Button
            variant="outline"
            onClick={() => {
              resetWizard();
              setShowResumeBanner(false);
            }}
          >
            Start fresh
          </Button>
          <Button variant="primary" onClick={() => setShowResumeBanner(false)}>
            Continue draft
          </Button>
        </Stack>
      </Box>
    );
  }

  const stepKey = WIZARD_STEPS[step].key;
  const isFormStep = ["basics", "location", "pricing"].includes(stepKey);

  return (
    <WizardShell
      step={step}
      maxReachedStep={maxReachedStep}
      onStepClick={goToStep}
      lastSavedAt={lastSavedAt}
      onBack={prevStep}
      onNext={handleNext}
      hideNext={stepKey === "publish"}
      nextDisabled={stepKey === "images" && images.length === 0}
    >
      {renderStep()}
    </WizardShell>
  );
}
