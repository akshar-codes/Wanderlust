import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "../services/notifications.service";

export const NOTIFICATIONS_KEY = "notifications";
export const UNREAD_COUNT_KEY = "unread-count";

export function useNotifications(params = {}) {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, params],
    queryFn: () => notificationsService.getAll(params),
    staleTime: 30000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: [UNREAD_COUNT_KEY],
    queryFn: () => notificationsService.getUnreadCount(),
    refetchInterval: 30000,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationsService.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
      qc.invalidateQueries({ queryKey: [UNREAD_COUNT_KEY] });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
      qc.invalidateQueries({ queryKey: [UNREAD_COUNT_KEY] });
    },
  });
}
