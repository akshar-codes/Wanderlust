export async function ensureWishlistShareTokenIndex(collection) {
  const indexes = await collection.indexes();
  const existing = indexes.find(
    (index) =>
      Object.keys(index.key ?? {}).length === 1 && index.key.shareToken === 1,
  );

  const isCurrent =
    existing?.unique === true &&
    existing?.partialFilterExpression?.shareToken?.$type === "string";

  if (existing && !isCurrent) {
    await collection.dropIndex(existing.name);
  }

  if (!isCurrent) {
    await collection.createIndex(
      { shareToken: 1 },
      {
        unique: true,
        partialFilterExpression: { shareToken: { $type: "string" } },
        name: "unique_shareToken",
        background: true,
      },
    );
  }

  return { changed: !isCurrent, droppedIndex: existing?.name ?? null };
}
