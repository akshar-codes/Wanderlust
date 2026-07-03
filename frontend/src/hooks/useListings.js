import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listingsService } from "../services/listings.service";
import toast from "react-hot-toast";

export const LISTINGS_KEY = "listings";
export const LISTING_KEY = "listing";

// ── Queries ───────────────────────────────────────────────────────────────────

export function useListings(params = {}) {
  return useQuery({
    queryKey: [LISTINGS_KEY, params],
    queryFn: () => listingsService.getAll(params),
    staleTime: 1000 * 60 * 2, // 2 min
  });
}

export function useListing(id) {
  return useQuery({
    queryKey: [LISTING_KEY, id],
    queryFn: () => listingsService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => listingsService.create(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [LISTINGS_KEY] });
      toast.success("Listing created!");
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useUpdateListing(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => listingsService.update(id, formData),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: [LISTINGS_KEY] });
      qc.setQueryData([LISTING_KEY, id], updated);
      toast.success("Listing updated!");
    },
    onError: (err) => toast.error(err.message),
  });
}

/**
 * Partial (PATCH) update — sends only the fields that changed.
 * Used by the redesigned Edit Listing page's confirm-and-save flow.
 */
export function usePartialUpdateListing(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patchData) => listingsService.partialUpdate(id, patchData),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: [LISTINGS_KEY] });
      qc.setQueryData([LISTING_KEY, id], updated);
    },
    onError: (err) => toast.error(err.message || "Failed to save changes"),
  });
}

export function useDeleteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => listingsService.delete(id),
    onSuccess: (_data, id) => {
      // Remove from cache immediately — avoids a refetch on the now-deleted item
      qc.removeQueries({ queryKey: [LISTING_KEY, id] });
      qc.invalidateQueries({ queryKey: [LISTINGS_KEY] });
      // NOTE: callers are responsible for navigation; toast lives here only
      toast.success("Listing deleted.");
    },
    onError: (err) => toast.error(err.message),
  });
}

// ── Publish / draft ───────────────────────────────────────────────────────────

export function usePublishListing(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => listingsService.publish(id),
    onSuccess: (updated) => {
      qc.setQueryData([LISTING_KEY, id], updated);
      qc.invalidateQueries({ queryKey: [LISTINGS_KEY] });
      toast.success("Listing published.");
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useUnpublishListing(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => listingsService.unpublish(id),
    onSuccess: (updated) => {
      qc.setQueryData([LISTING_KEY, id], updated);
      qc.invalidateQueries({ queryKey: [LISTINGS_KEY] });
      toast.success("Listing moved to drafts.");
    },
    onError: (err) => toast.error(err.message),
  });
}

// ── Image management ───────────────────────────────────────────────────────────

export function useAddListingImages(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files) => listingsService.addImages(id, files),
    onSuccess: (updated) => {
      qc.setQueryData([LISTING_KEY, id], updated);
      toast.success("Photo added.");
    },
    onError: (err) => toast.error(err.message || "Failed to upload photo"),
  });
}

export function useRemoveListingImage(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (imageId) => listingsService.removeImage(id, imageId),
    onSuccess: (updated) => {
      qc.setQueryData([LISTING_KEY, id], updated);
      toast.success("Photo removed.");
    },
    onError: (err) => toast.error(err.message || "Failed to remove photo"),
  });
}

export function useSetPrimaryListingImage(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (imageId) => listingsService.setPrimaryImage(id, imageId),
    onSuccess: (updated) => {
      qc.setQueryData([LISTING_KEY, id], updated);
      toast.success("Cover photo updated.");
    },
    onError: (err) =>
      toast.error(err.message || "Failed to update cover photo"),
  });
}
