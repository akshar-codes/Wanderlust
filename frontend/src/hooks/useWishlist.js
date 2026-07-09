import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { wishlistService } from "../services/wishlist.service";

export const WISHLIST_KEY = "wishlist";

export function useWishlist({ enabled = true, ...params } = {}) {
  return useQuery({
    queryKey: [WISHLIST_KEY, params],
    queryFn: () => wishlistService.getAll(params),
    enabled,
    staleTime: 1000 * 60,
    keepPreviousData: true,
  });
}

export function useToggleWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (listingId) => wishlistService.toggle(listingId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [WISHLIST_KEY] });
      toast.success(
        data.wishlisted ? "Added to wishlist" : "Removed from wishlist",
      );
    },
    onError: (err) => toast.error(err.message || "Failed to update wishlist"),
  });
}

export function useRemoveFromWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (listingId) => wishlistService.remove(listingId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [WISHLIST_KEY] });
      toast.success("Removed from wishlist");
    },
    onError: (err) => toast.error(err.message || "Failed to remove"),
  });
}
