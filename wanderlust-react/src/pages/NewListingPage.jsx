import { useNavigate } from "react-router-dom";
import { useCreateListing } from "../hooks/useListings";
import ListingForm from "../components/listings/ListingForm";

export default function NewListingPage() {
  const navigate = useNavigate();
  const { mutate: createListing, isPending } = useCreateListing();

  const handleSubmit = (formData) => {
    createListing(formData, {
      onSuccess: () => navigate("/listings"),
    });
  };

  return (
    <div className="form-page">
      <div className="form-page__card">
        <h1 className="form-page__title">List Your Space</h1>
        <p className="form-page__subtitle">
          Share your home with travellers from around the world.
        </p>
        <ListingForm
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          submitLabel="Create Listing"
        />
      </div>
    </div>
  );
}
