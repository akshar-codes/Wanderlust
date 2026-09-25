import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowLeft, Send } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { useCurrentUser } from "../hooks/useCurrentUser";
import {
  useBookingMessages,
  useConversations,
  useMessageEvents,
  useSendMessage,
} from "../hooks/useMessages";

const displayName = (person) =>
  [person?.firstName, person?.lastName].filter(Boolean).join(" ") ||
  person?.username ||
  "Wanderlust member";
const messageTime = (value) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default function MessagesPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);
  const conversations = useConversations();
  useMessageEvents();
  const thread = useBookingMessages(bookingId);
  const sendMessage = useSendMessage(bookingId);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread.data?.messages?.length, bookingId]);

  const submit = (event) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || sendMessage.isPending) return;
    sendMessage.mutate(body, { onSuccess: () => setDraft("") });
  };

  const selectedConversation = conversations.data?.find(
    (item) => String(item.booking.id) === String(bookingId),
  );
  const participant = thread.data?.booking
    ? String(thread.data.booking.guest?._id) === String(user?.id ?? user?._id)
      ? thread.data.booking.host
      : thread.data.booking.guest
    : selectedConversation?.otherParticipant;

  return (
    <Box sx={{ maxWidth: 1120, mx: "auto", px: { xs: 0, sm: 1 }, pb: 8 }}>
      <PageHeader
        eyebrow="Your account"
        title="Messages"
        subtitle="Talk with guests and hosts about your bookings."
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "340px minmax(0,1fr)" },
          gap: 2,
          minHeight: 520,
        }}
      >
        <Card variant="raised" sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Typography sx={{ px: 2, py: 1.5, fontWeight: 700 }}>
            Booking conversations
          </Typography>
          <Divider />
          {conversations.isLoading ? (
            <Box sx={{ p: 3, display: "grid", placeItems: "center" }}>
              <CircularProgress size={24} />
            </Box>
          ) : conversations.data?.length ? (
            conversations.data.map((item) => {
              const active = String(item.booking.id) === String(bookingId);
              return (
                <Box
                  key={item.booking.id}
                  component="button"
                  onClick={() => navigate(`/messages/${item.booking.id}`)}
                  sx={{
                    width: "100%",
                    textAlign: "left",
                    p: 1.75,
                    display: "flex",
                    gap: 1.25,
                    alignItems: "center",
                    border: 0,
                    borderBottom: "1px solid var(--color-border)",
                    bgcolor: active ? "var(--color-primary-50)" : "transparent",
                    color: "var(--color-text)",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "var(--color-surface-2)" },
                  }}
                >
                  <Avatar src={item.otherParticipant?.avatar}>
                    {displayName(item.otherParticipant)
                      .slice(0, 1)
                      .toUpperCase()}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      noWrap
                      sx={{ fontWeight: 700, fontSize: ".9rem" }}
                    >
                      {displayName(item.otherParticipant)}
                    </Typography>
                    <Typography noWrap variant="caption" color="text.secondary">
                      {item.booking.listing?.title || "Booking"} ·{" "}
                      {item.latestMessage?.body || "Start the conversation"}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          ) : (
            <Typography sx={{ p: 2, color: "var(--color-text-secondary)" }}>
              No booking conversations yet. Once you have a booking, you can
              message the other participant here.
            </Typography>
          )}
        </Card>

        <Card
          variant="raised"
          sx={{
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            minHeight: 520,
            overflow: "hidden",
          }}
        >
          {!bookingId ? (
            <Box
              sx={{
                flex: 1,
                display: "grid",
                placeItems: "center",
                p: 4,
                textAlign: "center",
              }}
            >
              <Typography color="text.secondary">
                Choose a booking conversation to read and send messages.
              </Typography>
            </Box>
          ) : thread.isLoading ? (
            <Box sx={{ flex: 1, display: "grid", placeItems: "center" }}>
              <CircularProgress />
            </Box>
          ) : thread.isError ? (
            <Box sx={{ p: 3 }}>
              <Typography color="error">
                Couldn’t load this conversation. Check that it belongs to one of
                your bookings.
              </Typography>
              <Button onClick={() => navigate("/messages")}>
                Back to messages
              </Button>
            </Box>
          ) : (
            <>
              <Box
                sx={{ p: 2, display: "flex", gap: 1.25, alignItems: "center" }}
              >
                <IconButton
                  onClick={() => navigate("/messages")}
                  aria-label="Back to conversations"
                  sx={{ display: { xs: "inline-flex", md: "none" } }}
                >
                  <ArrowLeft size={19} />
                </IconButton>
                <Avatar src={participant?.avatar}>
                  {displayName(participant).slice(0, 1).toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700 }}>
                    {displayName(participant)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {thread.data?.booking?.listing?.title} ·{" "}
                    {thread.data?.booking?.status}
                  </Typography>
                </Box>
              </Box>
              <Divider />
              <Box
                sx={{
                  flex: 1,
                  maxHeight: 440,
                  overflowY: "auto",
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.25,
                }}
              >
                {thread.data?.messages?.length ? (
                  thread.data.messages.map((message) => {
                    const own =
                      String(message.sender?._id) ===
                      String(user?.id ?? user?._id);
                    return (
                      <Box
                        key={message._id}
                        sx={{
                          alignSelf: own ? "flex-end" : "flex-start",
                          maxWidth: "82%",
                        }}
                      >
                        <Box
                          sx={{
                            px: 1.75,
                            py: 1.25,
                            borderRadius: 3,
                            bgcolor: own
                              ? "var(--color-primary-500)"
                              : "var(--color-surface-2)",
                            color: own ? "#fff" : "var(--color-text)",
                            whiteSpace: "pre-wrap",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {message.body}
                        </Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            textAlign: own ? "right" : "left",
                            mt: 0.35,
                          }}
                        >
                          {messageTime(message.createdAt)}
                        </Typography>
                      </Box>
                    );
                  })
                ) : (
                  <Typography
                    sx={{
                      m: "auto",
                      color: "var(--color-text-secondary)",
                      textAlign: "center",
                    }}
                  >
                    No messages yet. Say hello to start the conversation.
                  </Typography>
                )}
                <div ref={endRef} />
              </Box>
              <Divider />
              <Box
                component="form"
                onSubmit={submit}
                sx={{ p: 1.5, display: "flex", alignItems: "flex-end", gap: 1 }}
              >
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  value={draft}
                  onChange={(event) =>
                    setDraft(event.target.value.slice(0, 2000))
                  }
                  placeholder="Write a message…"
                  inputProps={{
                    maxLength: 2000,
                    "aria-label": "Write a message",
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  aria-label="Send message"
                  disabled={!draft.trim() || sendMessage.isPending}
                  sx={{ minWidth: 48, width: 48, height: 48, p: 0 }}
                >
                  <Send size={18} />
                </Button>
              </Box>
            </>
          )}
        </Card>
      </Box>
    </Box>
  );
}
