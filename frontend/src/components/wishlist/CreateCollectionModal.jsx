import { useState } from "react";
import { Stack } from "@mui/material";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input, Textarea } from "../ui/Input";
import { useCreateWishlistCollection } from "../../hooks/useWishlist";

export default function CreateCollectionModal({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { mutate: createCollection, isPending } = useCreateWishlistCollection();

  const handleClose = () => {
    if (isPending) return;
    setName("");
    setDescription("");
    onClose();
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    createCollection(
      { name: name.trim(), description: description.trim() || undefined },
      {
        onSuccess: (collection) => {
          setName("");
          setDescription("");
          onClose();
          onCreated?.(collection);
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create a new wishlist"
      maxWidth="xs"
      actions={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isPending}
            disabled={!name.trim()}
          >
            Create
          </Button>
        </>
      }
    >
      <Stack spacing={2.5} pt={1}>
        <Input
          label="Name"
          placeholder="e.g. Summer getaways"
          value={name}
          onChange={(e) => setName(e.target.value)}
          hint={`${name.length}/60 characters`}
          autoFocus
        />
        <Textarea
          label="Description (optional)"
          placeholder="What's this wishlist for?"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          hint={`${description.length}/300 characters`}
        />
      </Stack>
    </Modal>
  );
}