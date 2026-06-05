import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsService } from "../services/reviews.service";
import { LISTING_KEY } from "./useListings";
import toast from "react-hot-toast";

export function useCreateReview(listingId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reviewData) => reviewsService.create(listingId, reviewData),
    onSuccess: () => {
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
      qc.invalidateQueries({ queryKey: [LISTING_KEY, listingId] });
      toast.success("Review deleted.");
    },
    onError: (err) => toast.error(err.message),
  });
}
