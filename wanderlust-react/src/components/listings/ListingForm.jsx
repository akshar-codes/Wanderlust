import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createListingSchema,
  editListingSchema,
  LISTING_CATEGORIES,
} from "../../schemas";

const CATEGORY_LABELS = {
  trending: "Trending",
  rooms: "Rooms",
  iconic: "Iconic City",
  mountains: "Mountains",
  castles: "Castles",
  pools: "Amazing Pools",
  camping: "Camping",
  farms: "Farms",
  arctic: "Arctic",
  domes: "Domes",
  boats: "Boats",
};

/**
 * Shared form for both Create and Edit.
 * Pass `defaultValues` to switch into edit mode (image becomes optional).
 */
export default function ListingForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
}) {
  const isEdit = Boolean(defaultValues);
  const schema = isEdit ? editListingSchema : createListingSchema;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {},
  });

  // Repopulate when editing — runs when defaultValues load from the API
  useEffect(() => {
    if (defaultValues) reset(defaultValues);
  }, [defaultValues, reset]);

  const handleFormSubmit = (data) => {
    const fd = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === "image") {
        // FileList from <input type="file"> — only append if a file was chosen
        if (value instanceof FileList && value.length > 0) {
          fd.append("listing[image]", value[0]);
        }
        // If no file chosen on edit, skip — backend keeps the existing image
      } else {
        fd.append(`listing[${key}]`, value);
      }
    });

    onSubmit(fd);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="listing-form"
      noValidate
      encType="multipart/form-data"
    >
      {/* ── Title ─────────────────────────────────────────────────────── */}
      <div className="form-group">
        <label className="form-label" htmlFor="lf-title">
          Title
        </label>
        <input
          id="lf-title"
          type="text"
          className={`form-input${errors.title ? " form-input--error" : ""}`}
          placeholder="Add a catchy title"
          {...register("title")}
        />
        {errors.title && (
          <p className="form-error" role="alert">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* ── Category ──────────────────────────────────────────────────── */}
      <div className="form-group">
        <label className="form-label" htmlFor="lf-category">
          Category
        </label>
        <select
          id="lf-category"
          className={`form-select${errors.category ? " form-input--error" : ""}`}
          {...register("category")}
        >
          <option value="">Select a category</option>
          {LISTING_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c] || c}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="form-error" role="alert">
            {errors.category.message}
          </p>
        )}
      </div>

      {/* ── Description ───────────────────────────────────────────────── */}
      <div className="form-group">
        <label className="form-label" htmlFor="lf-description">
          Description
        </label>
        <textarea
          id="lf-description"
          rows={5}
          className={`form-textarea${errors.description ? " form-input--error" : ""}`}
          placeholder="Describe your listing"
          {...register("description")}
        />
        {errors.description && (
          <p className="form-error" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* ── Image upload ───────────────────────────────────────────────── */}
      <div className="form-group">
        <label className="form-label" htmlFor="lf-image">
          {isEdit ? "Replace Image (optional)" : "Listing Image"}
        </label>
        <input
          id="lf-image"
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          className="form-file"
          {...register("image")}
        />
        <p className="form-hint">JPG or PNG, max 10 MB</p>
      </div>

      {/* ── Price & Country ────────────────────────────────────────────── */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="lf-price">
            Price (₹ / night)
          </label>
          <input
            id="lf-price"
            type="number"
            min="0"
            step="1"
            className={`form-input${errors.price ? " form-input--error" : ""}`}
            placeholder="1200"
            {...register("price")}
          />
          {errors.price && (
            <p className="form-error" role="alert">
              {errors.price.message}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="lf-country">
            Country
          </label>
          <input
            id="lf-country"
            type="text"
            className={`form-input${errors.country ? " form-input--error" : ""}`}
            placeholder="India"
            {...register("country")}
          />
          {errors.country && (
            <p className="form-error" role="alert">
              {errors.country.message}
            </p>
          )}
        </div>
      </div>

      {/* ── Location ───────────────────────────────────────────────────── */}
      <div className="form-group">
        <label className="form-label" htmlFor="lf-location">
          Location
        </label>
        <input
          id="lf-location"
          type="text"
          className={`form-input${errors.location ? " form-input--error" : ""}`}
          placeholder="Vasant Kunj, New Delhi"
          {...register("location")}
        />
        {errors.location && (
          <p className="form-error" role="alert">
            {errors.location.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="btn btn--primary btn--full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
