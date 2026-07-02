import { forwardRef, useImperativeHandle, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Typography } from "@mui/material";
import { MapPin } from "lucide-react";
import { Input } from "../../../ui/Input";
import { locationSchema } from "../../../../schemas/listingWizard";
import { neutral, radii } from "../../../../theme/tokens";

// Lightweight static-map preview via Mapbox's static images API — avoids
// spinning up a full mapbox-gl instance just to show a confirmation pin.
function useStaticMapPreview(location, country) {
  const [url, setUrl] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | found | notfound

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    const query = [location, country].filter(Boolean).join(", ").trim();
    if (!token || query.length < 3) {
      setUrl(null);
      setStatus("idle");
      return;
    }
    setStatus("loading");
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?limit=1&access_token=${token}`,
        );
        const json = await res.json();
        const feature = json.features?.[0];
        if (!feature) {
          setUrl(null);
          setStatus("notfound");
          return;
        }
        const [lng, lat] = feature.center;
        setUrl(
          `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+ff5a5f(${lng},${lat})/${lng},${lat},11,0/640x260@2x?access_token=${token}`,
        );
        setStatus("found");
      } catch {
        setStatus("notfound");
      }
    }, 600);
    return () => clearTimeout(t);
  }, [location, country]);

  return { url, status };
}

const StepLocation = forwardRef(function StepLocation(
  { defaultValues, onValid },
  ref,
) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(locationSchema),
    defaultValues,
    mode: "onChange",
  });

  const location = watch("location");
  const country = watch("country");
  const { url: mapUrl, status } = useStaticMapPreview(location, country);

  useImperativeHandle(ref, () => ({
    submit: () =>
      new Promise((resolve) =>
        handleSubmit(
          (data) => {
            onValid(data);
            resolve(true);
          },
          () => resolve(false),
        )(),
      ),
  }));

  return (
    <Box
      component="form"
      sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}
    >
      <Box>
        <Typography
          sx={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "1.5rem",
            color: neutral[800],
            mb: 0.5,
          }}
        >
          Where's your place located?
        </Typography>
        <Typography variant="body2" sx={{ color: neutral[500] }}>
          Your exact address is only shared with guests after they book.
        </Typography>
      </Box>

      <Input
        label="Location"
        placeholder="Neighbourhood, city — e.g. Vasant Kunj, New Delhi"
        error={errors.location?.message}
        startAdornment={<MapPin size={16} style={{ color: neutral[400] }} />}
        {...register("location")}
      />
      <Input
        label="Country"
        placeholder="India"
        error={errors.country?.message}
        {...register("country")}
      />

      <Box
        sx={{
          borderRadius: radii.xl,
          overflow: "hidden",
          border: `1px solid ${neutral[200]}`,
          minHeight: 200,
          bgcolor: neutral[50],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {mapUrl ? (
          <img
            src={mapUrl}
            alt="Location preview"
            style={{ width: "100%", display: "block" }}
          />
        ) : (
          <Typography variant="caption" sx={{ color: neutral[400], py: 6 }}>
            {status === "loading"
              ? "Looking up this location…"
              : status === "notfound"
                ? "Couldn't find that location — check spelling or add more detail"
                : "Enter a location to preview it on the map"}
          </Typography>
        )}
      </Box>
    </Box>
  );
});

export default StepLocation;
