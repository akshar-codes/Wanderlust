const clientsByUser = new Map();

export function subscribeToUserMessages(userId, response) {
  const key = String(userId);
  const clients = clientsByUser.get(key) ?? new Set();
  clients.add(response);
  clientsByUser.set(key, clients);

  return () => {
    clients.delete(response);
    if (!clients.size) clientsByUser.delete(key);
  };
}

export function publishMessageToUsers(userIds, message) {
  const payload = JSON.stringify({
    bookingId: String(message.booking),
    message,
  });
  const frame = `event: message\ndata: ${payload}\n\n`;
  const delivered = new Set();
  for (const userId of userIds) {
    for (const response of clientsByUser.get(String(userId)) ?? []) {
      if (
        delivered.has(response) ||
        response.writableEnded ||
        response.destroyed
      )
        continue;
      delivered.add(response);
      response.write(frame);
    }
  }
}

export function activeMessageStreams() {
  return [...clientsByUser.values()].reduce(
    (count, clients) => count + clients.size,
    0,
  );
}
