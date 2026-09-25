import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { messageService } from "../services/message.service";

export const CONVERSATIONS_KEY = ["message-conversations"];
export const messagesKey = (bookingId) => ["booking-messages", bookingId];

export function useConversations() {
  return useQuery({
    queryKey: CONVERSATIONS_KEY,
    queryFn: messageService.listConversations,
  });
}

export function useBookingMessages(bookingId) {
  return useQuery({
    queryKey: messagesKey(bookingId),
    queryFn: () => messageService.listMessages(bookingId),
    enabled: !!bookingId,
  });
}

export function useMessageEvents() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const events = new EventSource("/api/messages/events");
    const onMessage = (event) => {
      let payload;
      try {
        payload = JSON.parse(event.data);
      } catch {
        return;
      }
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
      if (payload.bookingId)
        queryClient.invalidateQueries({
          queryKey: messagesKey(payload.bookingId),
        });
    };
    events.addEventListener("message", onMessage);
    return () => {
      events.removeEventListener("message", onMessage);
      events.close();
    };
  }, [queryClient]);
}

export function useSendMessage(bookingId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => messageService.send(bookingId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagesKey(bookingId) });
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
    onError: (error) =>
      toast.error(error.message || "Message could not be sent"),
  });
}
