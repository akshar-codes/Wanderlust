import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from "@mui/material";
import {
  ChevronDown,
  MapPin,
  Image as ImageIcon,
  Tag,
  DollarSign,
  Save,
} from "lucide-react";

import { useListing, usePartialUpdateListing } from "../hooks/useListings";
import Spinner from "../components/common/Spinner";
import { Button } from "../components/ui/Button";
import PageHeader from "../components/layout/PageHeader";

// ── Reused from the Add Listing wizard ──────────────────────────────────────
import StepBasicDetails from "../components/listings/wizard/steps/StepBasicDetails";
import StepLocation from "../components/listings/wizard/steps/StepLocation";
import StepAmenities from "../components/listings/wizard/steps/StepAmenities";
import StepPricing from "../components/listings/wizard/steps/StepPricing";

import AnalyticsSummary from "../components/listings/edit/AnalyticsSummary";
import EditImageManager from "../components/listings/edit/EditImageManager";
import DraftVisibilityPanel from "../components/listings/edit/DraftVisibilityPanel";
import ConfirmChangesDialog from "../components/listings/edit/ConfirmChangesDialog";

import { neutral, brand, radii, shadows } from "../theme/tokens";

// ── Listing → editable-shape mapping ────────────────────────────────────────

function listingToEditableData(listing) {
  return {
    title: listing.title ?? "",
    category: listing.category ?? "",
    propertyType: listing.propertyType ?? "other",
    description: listing.description ?? "",
    shortDescription: listing.shortDescription ?? "",
    bedrooms: listing.bedrooms ?? 1,
    bathrooms: listing.bathrooms ?? 1,
    beds: listing.beds ?? 1,
    maxGuests: listing.maxGuests ?? 2,
    location: listing.location ?? "",
    country: listing.country ?? "",
    amenities: listing.amenities ?? [],
    price: listing.pricing?.nightlyPrice ?? listing.price ?? 0,
    cleaningFee: listing.pricing?.cleaningFee ?? 0,
    serviceFee: listing.pricing?.serviceFee ?? 0,
    taxes: listing.pricing?.taxes ?? 0,
    minimumStay: listing.minimumStay ?? 1,
    maximumStay: listing.maximumStay ?? "",
    draft: listing.draft ?? false,
  };
}

const FIELD_LABELS = {
  title: "Title",
  description: "Description",
  shortDescription: "Short description",
  propertyType: "Property type",
  category: "Category",
  location: "Location",
  country: "Country",
  bedrooms: "Bedrooms",
  bathrooms: "Bathrooms",
  beds: "Beds",
  maxGuests: "Max guests",
  minimumStay: "Minimum stay",
  maximumStay: "Maximum stay",
};

/** Builds a minimal PATCH payload + human-readable diff from two editable snapshots. */
function buildPatchPayload(original, candidate) {
  const patch = {};
  const changes = [];

  Object.entries(FIELD_LABELS).forEach(([key, label]) => {
    const oldV = original[key];
    const newV = candidate[key];
    const oldStr = oldV === null || oldV === undefined ? "" : String(oldV);
    const newStr = newV === null || newV === undefined ? "" : String(newV);

    if (oldStr !== newStr) {
      patch[key] =
        key === "maximumStay"
          ? newV === "" || newV == null
            ? null
            : Number(newV)
          : newV;
      changes.push({ key, label, oldValue: oldV, newValue: newV });
    }
  });

  const oldAmenities = [...(original.amenities ?? [])].sort();
  const newAmenities = [...(candidate.amenities ?? [])].sort();
  if (JSON.stringify(oldAmenities) !== JSON.stringify(newAmenities)) {
    patch.amenities = candidate.amenities;
    changes.push({
      key: "amenities",
      label: "Amenities",
      oldValue: `${oldAmenities.length} selected`,
      newValue: `${newAmenities.length} selected`,
    });
  }

  const pricingChanged =
    Number(original.price) !== Number(candidate.price) ||
    Number(original.cleaningFee) !== Number(candidate.cleaningFee) ||
    Number(original.serviceFee) !== Number(candidate.serviceFee) ||
    Number(original.taxes) !== Number(candidate.taxes);

  if (pricingChanged) {
    patch.pricing = {
      nightlyPrice: Number(candidate.price) || 0,
      cleaningFee: Number(candidate.cleaningFee) || 0,
      serviceFee: Number(candidate.serviceFee) || 0,
      taxes: Number(candidate.taxes) || 0,
    };
    changes.push({
      key: "pricing",
      label: "Price per night",
      oldValue: `₹${Number(original.price || 0).toLocaleString("en-IN")}`,
      newValue: `₹${Number(candidate.price || 0).toLocaleString("en-IN")}`,
    });
  }

  if (Boolean(original.draft) !== Boolean(candidate.draft)) {
    patch.draft = candidate.draft;
    changes.push({
      key: "draft",
      label: "Visibility",
      oldValue: original.draft ? "Draft" : "Published",
      newValue: candidate.draft ? "Draft" : "Published",
    });
  }

  return { patch, changes };
}

// ── Collapsible section wrapper ─────────────────────────────────────────────

function Section({ icon, title, subtitle, children, defaultExpanded = true }) {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      elevation={0}
      sx={{
        border: `1px solid ${neutral[200]}`,
        borderRadius: `${radii.xl} !important`,
        overflow: "hidden",
        "&:before": { display: "none" },
        boxShadow: shadows.card,
      }}
    >
      <AccordionSummary
        expandIcon={<ChevronDown size={18} color={neutral[500]} />}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ color: brand[500], display: "flex" }}>{icon}</Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.9375rem",
                color: neutral[800],
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: neutral[500] }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 1, pb: 3, px: { xs: 2, sm: 3 } }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
}

// ── Content — mounted only once listing data is available, so default

function EditListingContent({ listing }) {
  const navigate = useNavigate();
  const original = listingToEditableData(listing);

  const basicRef = useRef(null);
  const locationRef = useRef(null);
  const pricingRef = useRef(null);
  const candidateRef = useRef({ ...original });

  const [amenities, setAmenities] = useState(original.amenities);
  const [draft, setDraft] = useState(original.draft);
  const [confirmState, setConfirmState] = useState(null); // { patch, changes } | null
  const [saving, setSaving] = useState(false);

  const { mutateAsync: partialUpdate } = usePartialUpdateListing(listing._id);

  const mergeCandidate = (data) => {
    candidateRef.current = { ...candidateRef.current, ...data };
  };

  const handleReviewChanges = async () => {
    const results = await Promise.all([
      basicRef.current?.submit(),
      locationRef.current?.submit(),
      pricingRef.current?.submit(),
    ]);

    if (results.some((ok) => ok === false)) {
      toast.error("Please fix the highlighted errors before saving.");
      return;
    }

    candidateRef.current.amenities = amenities;
    candidateRef.current.draft = draft;

    const { patch, changes } = buildPatchPayload(
      original,
      candidateRef.current,
    );

    if (changes.length === 0) {
      toast("No changes to save.");
      return;
    }

    setConfirmState({ patch, changes });
  };

  const handleConfirmSave = async () => {
    if (!confirmState) return;
    setSaving(true);
    try {
      await partialUpdate(confirmState.patch);
      toast.success("Listing updated successfully.");
      setConfirmState(null);
      navigate(`/listings/${listing._id}`);
    } catch {
      // error toast already dispatched by the mutation's onError handler
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      className="page-container"
      sx={{ py: { xs: 3, md: 5 }, maxWidth: 880, mx: "auto !important" }}
    >
      <PageHeader
        eyebrow="Manage listing"
        title="Edit listing"
        subtitle="Update details, manage photos, and control visibility for this listing."
        breadcrumbs={[
          { label: "Listings", to: "/listings" },
          { label: listing.title, to: `/listings/${listing._id}` },
          { label: "Edit" },
        ]}
      />

      <Stack spacing={3} sx={{ mb: 12 }}>
        <Box
          sx={{
            border: `1px solid ${neutral[200]}`,
            borderRadius: radii.xl,
            p: { xs: 2.5, sm: 3 },
            boxShadow: shadows.card,
          }}
        >
          <AnalyticsSummary listing={listing} />
        </Box>

        <DraftVisibilityPanel draft={draft} onChange={setDraft} />

        <Section
          icon={<Tag size={18} />}
          title="Basic details"
          subtitle="Title, category, description, and capacity"
        >
          <StepBasicDetails
            ref={basicRef}
            defaultValues={original}
            onValid={mergeCandidate}
          />
        </Section>

        <Section
          icon={<MapPin size={18} />}
          title="Location"
          subtitle="Where guests will find this stay"
        >
          <StepLocation
            ref={locationRef}
            defaultValues={original}
            onValid={mergeCandidate}
          />
        </Section>

        <Section
          icon={<ImageIcon size={18} />}
          title="Photos"
          subtitle="Manage cover photo and gallery"
        >
          <EditImageManager
            listingId={listing._id}
            images={listing.images ?? []}
          />
        </Section>

        <Section
          icon={<Tag size={18} />}
          title="Amenities"
          subtitle="What this place offers"
          defaultExpanded={false}
        >
          <StepAmenities selected={amenities} onChange={setAmenities} />
        </Section>

        <Section
          icon={<DollarSign size={18} />}
          title="Pricing"
          subtitle="Nightly rate, fees, and stay limits"
        >
          <StepPricing
            ref={pricingRef}
            defaultValues={original}
            onValid={mergeCandidate}
          />
        </Section>
      </Stack>

      {/* Sticky save bar */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(12px)",
          borderTop: `1px solid ${neutral[200]}`,
          px: { xs: 2.5, md: 4 },
          py: 2,
          display: "flex",
          justifyContent: "flex-end",
          gap: 1.5,
          zIndex: 50,
        }}
      >
        <Button
          variant="ghost"
          onClick={() => navigate(`/listings/${listing._id}`)}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          startIcon={<Save size={16} />}
          onClick={handleReviewChanges}
        >
          Review & save changes
        </Button>
      </Box>

      <ConfirmChangesDialog
        open={!!confirmState}
        onClose={() => !saving && setConfirmState(null)}
        changes={confirmState?.changes ?? []}
        onConfirm={handleConfirmSave}
        loading={saving}
      />
    </Box>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EditListingPage() {
  const { id } = useParams();
  const { data: listing, isLoading, isError } = useListing(id);

  if (isLoading) {
    return (
      <div className="center-screen">
        <Spinner size={42} />
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <Typography
          sx={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "1.5rem",
            color: neutral[800],
          }}
        >
          Listing not found
        </Typography>
      </Box>
    );
  }

  // key={listing._id} guarantees a fresh mount (and fresh default values)
  // if the user navigates directly between two different listings' edit pages.
  return <EditListingContent key={listing._id} listing={listing} />;
}
