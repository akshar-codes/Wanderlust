import api from "./api";

export const messageService = {
  listConversations: async () =>
    (await api.get("/messages")).data.data.conversations,
  listMessages: async (bookingId) =>
    (await api.get(`/messages/${bookingId}`)).data.data,
  send: async (bookingId, body) =>
    (await api.post(`/messages/${bookingId}`, { body })).data.data.message,
};
