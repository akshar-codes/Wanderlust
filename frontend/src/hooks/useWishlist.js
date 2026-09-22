import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { wishlistService } from "../services/wishlist.service";

export const WISHLIST_KEY = "wishlist";
export const WISHLIST_STATUS_KEY = "wishlist-status";
export const WISHLIST_COLLECTIONS_KEY = "wishlist-collections";
export const WISHLIST_COLLECTION_KEY = "wishlist-collection";
export const WISHLIST_SHARED_KEY = "wishlist-shared";

function invalidateWishlistCaches(qc, listingId) {
  qc.invalidateQueries({ queryKey: [WISHLIST_KEY] });
  qc.invalidateQueries({ queryKey: [WISHLIST_COLLECTIONS_KEY] });
  qc.invalidateQueries({ queryKey: [WISHLIST_COLLECTION_KEY] });
  if (listingId) {
    qc.invalidateQueries({ queryKey: [WISHLIST_STATUS_KEY, listingId] });
  }
}

// ── Items ───────────────────────────────────────────────────────────────────

export function useWishlist({ enabled = true, ...params } = {}) {
  return useQuery({
    queryKey: [WISHLIST_KEY, params],
    queryFn: () => wishlistService.getAll(params),
    enabled,
    staleTime: 1000 * 60,
    keepPreviousData: true,
  });
}

/** Which collections (if any) currently contain a given listing — powers heart state */
export function useWishlistStatus(listingId, { enabled = true } = {}) {
  return useQuery({
    queryKey: [WISHLIST_STATUS_KEY, listingId],
    queryFn: () => wishlistService.getStatus(listingId),
    enabled: enabled && !!listingId,
    staleTime: 1000 * 30,
  });
}

export function useToggleWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ listingId, collectionId }) =>
      wishlistService.toggle(listingId, collectionId),
    onMutate: async ({ listingId }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await qc.cancelQueries({ queryKey: [WISHLIST_STATUS_KEY, listingId] });

      // Snapshot the previous value
      const previousStatus = qc.getQueryData([WISHLIST_STATUS_KEY, listingId]);

      // Optimistically update to the new value
      qc.setQueryData([WISHLIST_STATUS_KEY, listingId], (old) => {
        // If we don't have old data, guess based on action
        if (!old) return { wishlisted: true, collectionIds: [] };
        return {
          ...old,
          wishlisted: !old.wishlisted,
        };
      });

      return { previousStatus, listingId };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousStatus) {
        qc.setQueryData(
          [WISHLIST_STATUS_KEY, context.listingId],
          context.previousStatus
        );
      }
      toast.error(err.message || "Failed to update wishlist");
    },
    onSuccess: (data, { listingId }) => {
      toast.success(
        data.wishlisted ? "Saved to wishlist" : "Removed from wishlist",
      );
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success to sync with server
      invalidateWishlistCaches(qc, variables.listingId);
    },
  });
}

export function useRemoveFromWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ listingId, collectionId }) =>
      wishlistService.remove(listingId, collectionId),
    onSuccess: (_data, { listingId }) => {
      invalidateWishlistCaches(qc, listingId);
      toast.success("Removed from wishlist");
    },
    onError: (err) => toast.error(err.message || "Failed to remove"),
  });
}

export function useMoveWishlistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ listingId, fromCollectionId, toCollectionId }) =>
      wishlistService.move(listingId, fromCollectionId, toCollectionId),
    onSuccess: (_data, { listingId }) => {
      invalidateWishlistCaches(qc, listingId);
      toast.success("Listing moved");
    },
    onError: (err) => toast.error(err.message || "Failed to move listing"),
  });
}

// ── Collections ─────────────────────────────────────────────────────────────

export function useWishlistCollections({ enabled = true } = {}) {
  return useQuery({
    queryKey: [WISHLIST_COLLECTIONS_KEY],
    queryFn: () => wishlistService.getCollections(),
    enabled,
    staleTime: 1000 * 60,
  });
}

export function useWishlistCollection(
  id,
  { page = 1, limit = 12, enabled = true } = {},
) {
  return useQuery({
    queryKey: [WISHLIST_COLLECTION_KEY, id, page, limit],
    queryFn: () => wishlistService.getCollection(id, { page, limit }),
    enabled: enabled && !!id,
    staleTime: 1000 * 30,
    keepPreviousData: true,
  });
}

export function useCreateWishlistCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => wishlistService.createCollection(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [WISHLIST_COLLECTIONS_KEY] });
      toast.success("Wishlist created");
    },
    onError: (err) => toast.error(err.message || "Failed to create wishlist"),
  });
}

export function useUpdateWishlistCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) =>
      wishlistService.updateCollection(id, updates),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: [WISHLIST_COLLECTIONS_KEY] });
      qc.invalidateQueries({ queryKey: [WISHLIST_COLLECTION_KEY, id] });
      toast.success("Wishlist updated");
    },
    onError: (err) => toast.error(err.message || "Failed to update wishlist"),
  });
}

export function useDeleteWishlistCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => wishlistService.deleteCollection(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [WISHLIST_COLLECTIONS_KEY] });
      toast.success("Wishlist deleted");
    },
    onError: (err) => toast.error(err.message || "Failed to delete wishlist"),
  });
}

export function useEnableWishlistSharing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => wishlistService.enableSharing(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: [WISHLIST_COLLECTION_KEY, id] });
      qc.invalidateQueries({ queryKey: [WISHLIST_COLLECTIONS_KEY] });
    },
    onError: (err) => toast.error(err.message || "Failed to enable sharing"),
  });
}

export function useDisableWishlistSharing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => wishlistService.disableSharing(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: [WISHLIST_COLLECTION_KEY, id] });
      qc.invalidateQueries({ queryKey: [WISHLIST_COLLECTIONS_KEY] });
      toast.success("Sharing disabled");
    },
    onError: (err) => toast.error(err.message || "Failed to disable sharing"),
  });
}

export function useSharedWishlist(
  token,
  { page = 1, limit = 12, enabled = true } = {},
) {
  return useQuery({
    queryKey: [WISHLIST_SHARED_KEY, token, page, limit],
    queryFn: () => wishlistService.getShared(token, { page, limit }),
    enabled: enabled && !!token,
    staleTime: 1000 * 60,
    keepPreviousData: true,
  });
}
