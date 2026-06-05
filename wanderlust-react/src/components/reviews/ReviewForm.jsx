import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewSchema } from "../../schemas";
import { StarPicker } from "../common/StarRating";
import { useCreateReview } from "../../hooks/useReviews";

export default function ReviewForm({ listingId }) {
  const { mutate: createReview, isPending } = useCreateReview(listingId);

  // Rating is managed as plain React state — no hidden input needed.
  // We inject it into RHF's data on submit via getValues/setValue pattern.
  const [rating, setRating] = useState(0);
  const [ratingError, setRatingError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    // Rating starts at 0; the custom star picker drives it separately.
    defaultValues: { rating: 0, comment: "" },
  });

  const onSubmit = (data) => {
    // Zod schema validates `rating`, but since the star picker is uncontrolled
    // from RHF's perspective, inject the current React state value.
    if (rating < 1) {
      setRatingError("Please choose a star rating");
      return;
    }
    setRatingError("");
    createReview(
      { ...data, rating },
      {
        onSuccess: () => {
          reset();
          setRating(0);
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="review-form" noValidate>
      <h3 className="review-form__heading">Leave a Review</h3>

      {/* ── Star picker ─────────────────────────────────────────────── */}
      <div className="form-group">
        <label className="form-label">Your Rating</label>
        <StarPicker
          value={rating}
          onChange={(val) => {
            setRating(val);
            if (val > 0) setRatingError("");
          }}
        />
        {ratingError && (
          <p className="form-error" role="alert">
            {ratingError}
          </p>
        )}
      </div>

      {/* ── Comment ─────────────────────────────────────────────────── */}
      <div className="form-group">
        <label className="form-label" htmlFor="review-comment">
          Comment
        </label>
        <textarea
          id="review-comment"
          rows={4}
          className={`form-textarea${errors.comment ? " form-input--error" : ""}`}
          placeholder="Share your experience…"
          {...register("comment")}
        />
        {errors.comment && (
          <p className="form-error" role="alert">
            {errors.comment.message}
          </p>
        )}
      </div>

      <button type="submit" className="btn btn--primary" disabled={isPending}>
        {isPending ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
