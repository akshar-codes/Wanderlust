import { forwardRef, useImperativeHandle } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Grid, Typography } from "@mui/material";
import { Input } from "../../../ui/Input";
import { Counter } from "../../../ui/Counter";
import { pricingSchema } from "../../../../schemas/listingWizard";
import { neutral, brand, radii } from "../../../../theme/tokens";

const GST_RATE = 0.18;

const StepPricing = forwardRef(function StepPricing(
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
    resolver: zodResolver(pricingSchema),
    defaultValues,
    mode: "onChange",
  });

  const price = Number(watch("price")) || 0;
  const cleaningFee = Number(watch("cleaningFee")) || 0;
  const serviceFee = Number(watch("serviceFee")) || 0;
  const gst = Math.round(price * GST_RATE);
  const guestTotal = price + cleaningFee + serviceFee + gst;

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
          Set your price
        </Typography>
        <Typography variant="body2" sx={{ color: neutral[500] }}>
          You can adjust pricing anytime after publishing.
        </Typography>
      </Box>

      <Input
        label="Price per night (₹)"
        type="number"
        placeholder="2500"
        error={errors.price?.message}
        {...register("price")}
      />

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Input
            label="Cleaning fee (₹)"
            type="number"
            {...register("cleaningFee")}
          />
        </Grid>
        <Grid item xs={6}>
          <Input
            label="Service fee (₹)"
            type="number"
            {...register("serviceFee")}
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          border: `1px solid ${neutral[200]}`,
          borderRadius: "16px",
          px: 2,
        }}
      >
        <Controller
          name="minimumStay"
          control={control}
          render={({ field }) => (
            <Counter
              label="Minimum stay"
              hint="nights"
              value={field.value}
              onChange={field.onChange}
              min={1}
              max={90}
            />
          )}
        />
      </Box>
      <Input
        label="Maximum stay (optional)"
        type="number"
        placeholder="No limit"
        {...register("maximumStay")}
      />

      <Box
        sx={{
          bgcolor: neutral[50],
          border: `1px solid ${neutral[200]}`,
          borderRadius: radii.xl,
          p: 2.5,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "0.875rem",
            color: neutral[800],
            mb: 1.5,
          }}
        >
          Guest price breakdown (1 night)
        </Typography>
        {[
          ["Nightly rate", price],
          ["Cleaning fee", cleaningFee],
          ["Service fee", serviceFee],
          ["GST (18%)", gst],
        ].map(([label, amount]) => (
          <Box
            key={label}
            sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}
          >
            <Typography variant="body2" sx={{ color: neutral[500] }}>
              {label}
            </Typography>
            <Typography variant="body2" sx={{ color: neutral[700] }}>
              ₹{amount.toLocaleString("en-IN")}
            </Typography>
          </Box>
        ))}
        <Box sx={{ height: 1, bgcolor: neutral[200], my: 1 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography sx={{ fontWeight: 700, color: neutral[800] }}>
            Guest pays
          </Typography>
          <Typography sx={{ fontWeight: 700, color: brand[600] }}>
            ₹{guestTotal.toLocaleString("en-IN")}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
});

export default StepPricing;
