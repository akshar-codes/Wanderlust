import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reviewsService } from "../services/reviews.service";
import { LISTING_KEY } from "./useListings";
import toast from "react-hot-toast";

// ── Query key factory ─────────────────────────────────────────────────────────

export const REVIEWS_KEY = "reviews";
export const REVIEW_STATS_KEY = "review-stats";

export const reviewKeys = {
  list: (listingId, opts) => [REVIEWS_KEY, listingId, opts],
  stats: (listingId) => [REVIEW_STATS_KEY, listingId],
};

// ── Queries ───────────────────────────────────────────────────────────────────

export function useListingReviews(listingId, opts = {}) {
  return useQuery({
    queryKey: reviewKeys.list(listingId, opts),
    queryFn: () => reviewsService.getAll(listingId, opts),
    enabled: !!listingId,
    staleTime: 1000 * 60 * 2,
    keepPreviousData: true,
  });
}

/**
 * Rich statistics for a listing's reviews.
 */
export function useReviewStats(listingId) {
  return useQuery({
    queryKey: reviewKeys.stats(listingId),
    queryFn: () => reviewsService.getStats(listingId),
    enabled: !!listingId,
    staleTime: 1000 * 60 * 5,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateReview(listingId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reviewData) => reviewsService.create(listingId, reviewData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [REVIEWS_KEY, listingId] });
      qc.invalidateQueries({ queryKey: reviewKeys.stats(listingId) });
      qc.invalidateQueries({ queryKey: [LISTING_KEY, listingId] });
      toast.success("Review posted!");
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useDeleteReview(listingId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reviewId) => reviewsService.delete(listingId, reviewId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [REVIEWS_KEY, listingId] });
      qc.invalidateQueries({ queryKey: reviewKeys.stats(listingId) });
      qc.invalidateQueries({ queryKey: [LISTING_KEY, listingId] });
      toast.success("Review deleted.");
    },
    onError: (err) => toast.error(err.message),
  });
}

// ── Host reply ────────────────────────────────────────────────────────────────

export function useUpsertHostReply(listingId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, text }) =>
      reviewsService.upsertHostReply(listingId, reviewId, text),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [REVIEWS_KEY, listingId] });
      toast.success("Response saved.");
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useDeleteHostReply(listingId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reviewId) =>
      reviewsService.deleteHostReply(listingId, reviewId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [REVIEWS_KEY, listingId] });
      toast.success("Response deleted.");
    },
    onError: (err) => toast.error(err.message),
  });
}

// ── Helpful vote ──────────────────────────────────────────────────────────────

export function useToggleHelpful(listingId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reviewId) => reviewsService.toggleHelpful(listingId, reviewId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [REVIEWS_KEY, listingId] });
    },
    onError: (err) => toast.error(err.message),
  });
}

// ── Photos ────────────────────────────────────────────────────────────────────

export function useAddReviewPhotos(listingId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, files }) =>
      reviewsService.addPhotos(listingId, reviewId, files),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [REVIEWS_KEY, listingId] });
      toast.success("Photos added.");
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useDeleteReviewPhoto(listingId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, photoId }) =>
      reviewsService.deletePhoto(listingId, reviewId, photoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [REVIEWS_KEY, listingId] });
    },
    onError: (err) => toast.error(err.message),
  });
}
