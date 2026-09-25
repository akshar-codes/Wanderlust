import * as messageService from "../services/message.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { subscribeToUserMessages } from "../realtime/messageEventHub.js";

export const index = async (req, res) =>
  sendSuccess(res, {
    conversations: await messageService.listConversations(req.user._id),
  });

export const show = async (req, res) =>
  sendSuccess(
    res,
    await messageService.listMessages(req.params.bookingId, req.user._id),
  );

export const create = async (req, res) =>
  sendSuccess(
    res,
    {
      message: await messageService.sendMessage(
        req.params.bookingId,
        req.user._id,
        req.body.body,
      ),
    },
    201,
  );

export const stream = async (req, res) => {
  res.status(200);
  res.set({
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders?.();
  res.write(`event: ready\ndata: ${JSON.stringify({ connected: true })}\n\n`);

  const unsubscribe = subscribeToUserMessages(req.user._id, res);
  const heartbeat = setInterval(() => {
    if (!res.writableEnded && !res.destroyed) res.write(": keep-alive\n\n");
  }, 25000);
  const cleanup = () => {
    clearInterval(heartbeat);
    unsubscribe();
  };
  res.on("close", cleanup);
};
