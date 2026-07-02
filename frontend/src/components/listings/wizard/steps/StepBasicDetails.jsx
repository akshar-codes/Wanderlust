import { forwardRef, useImperativeHandle } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Grid, Typography } from "@mui/material";
import { Input, Textarea } from "../../../ui/Input";
import { Counter } from "../../../ui/Counter";
import { basicDetailsSchema } from "../../../../schemas/listingWizard";
import { LISTING_CATEGORIES } from "../../../../schemas";
import { brand, neutral } from "../../../../theme/tokens";

const CATEGORY_META = {
  trending: { icon: "🔥", label: "Trending" },
  rooms: { icon: "🛏", label: "Rooms" },
  iconic: { icon: "🏙", label: "Iconic City" },
  mountains: { icon: "⛰", label: "Mountains" },
  castles: { icon: "🏰", label: "Castles" },
  pools: { icon: "🏊", label: "Amazing Pools" },
  camping: { icon: "⛺", label: "Camping" },
  farms: { icon: "🐄", label: "Farms" },
  arctic: { icon: "❄️", label: "Arctic" },
  domes: { icon: "🛖", label: "Domes" },
  boats: { icon: "⛵", label: "Boats" },
};

const StepBasicDetails = forwardRef(function StepBasicDetails(
  { defaultValues, onValid },
  ref,
) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(basicDetailsSchema),
    defaultValues,
    mode: "onChange",
  });

  const description = watch("description") ?? "";
  const category = watch("category");

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
          Let's start with the basics
        </Typography>
        <Typography variant="body2" sx={{ color: neutral[500] }}>
          A great title and description help guests picture themselves staying
          here.
        </Typography>
      </Box>

      <Input
        label="Listing title"
        placeholder="e.g. Sunlit cabin with mountain views"
        error={errors.title?.message}
        {...register("title")}
      />

      <Box>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "0.875rem",
            color: neutral[700],
            mb: 1,
          }}
        >
          Category
        </Typography>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
                gap: 1,
              }}
            >
              {LISTING_CATEGORIES.map((cat) => {
                const meta = CATEGORY_META[cat];
                const active = field.value === cat;
                return (
                  <Box
                    key={cat}
                    onClick={() => field.onChange(cat)}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0.5,
                      p: 1.5,
                      borderRadius: "14px",
                      cursor: "pointer",
                      border: `1.5px solid ${active ? brand[500] : neutral[200]}`,
                      bgcolor: active ? brand[50] : "#fff",
                      transition: "all 120ms",
                    }}
                  >
                    <Typography sx={{ fontSize: "1.3rem" }}>
                      {meta.icon}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        textAlign: "center",
                        color: active ? brand[700] : neutral[600],
                      }}
                    >
                      {meta.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        />
        {errors.category && (
          <Typography
            variant="caption"
            sx={{ color: "error.main", mt: 0.5, display: "block" }}
          >
            {errors.category.message}
          </Typography>
        )}
      </Box>

      <Textarea
        label="Description"
        placeholder="Describe what makes this place special…"
        rows={5}
        error={errors.description?.message}
        hint={
          !errors.description ? `${description.length} characters` : undefined
        }
        {...register("description")}
      />

      <Input
        label="Short tagline (optional)"
        placeholder="A catchy one-liner shown in search results"
        hint="Max 160 characters"
        error={errors.shortDescription?.message}
        {...register("shortDescription")}
      />

      <Box
        sx={{
          border: `1px solid ${neutral[200]}`,
          borderRadius: "16px",
          px: 2,
        }}
      >
        <Controller
          name="bedrooms"
          control={control}
          render={({ field }) => (
            <Counter
              label="Bedrooms"
              value={field.value}
              onChange={field.onChange}
              min={0}
            />
          )}
        />
        <Box sx={{ height: 1, bgcolor: neutral[100] }} />
        <Controller
          name="beds"
          control={control}
          render={({ field }) => (
            <Counter
              label="Beds"
              value={field.value}
              onChange={field.onChange}
              min={1}
            />
          )}
        />
        <Box sx={{ height: 1, bgcolor: neutral[100] }} />
        <Controller
          name="bathrooms"
          control={control}
          render={({ field }) => (
            <Counter
              label="Bathrooms"
              value={field.value}
              onChange={field.onChange}
              min={0}
            />
          )}
        />
        <Box sx={{ height: 1, bgcolor: neutral[100] }} />
        <Controller
          name="maxGuests"
          control={control}
          render={({ field }) => (
            <Counter
              label="Max guests"
              hint="Total guests allowed"
              value={field.value}
              onChange={field.onChange}
              min={1}
              max={30}
            />
          )}
        />
      </Box>
    </Box>
  );
});

export default StepBasicDetails;
