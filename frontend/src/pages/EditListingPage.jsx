import { useParams, useNavigate } from "react-router-dom";
import { useListing, useUpdateListing } from "../hooks/useListings";
import ListingForm from "../components/listings/ListingForm";
import Spinner from "../components/common/Spinner";

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: listing, isLoading } = useListing(id);
  const { mutate: updateListing, isPending } = useUpdateListing(id);

  const handleSubmit = (formData) => {
    updateListing(formData, {
      onSuccess: () => navigate(`/listings/${id}`),
    });
  };

  if (isLoading) {
    return (
      <div className="center-screen">
        <Spinner size={42} />
      </div>
    );
  }

  const defaultValues = listing
    ? {
        title: listing.title,
        description: listing.description,
        location: listing.location,
        country: listing.country,
        price: String(listing.price),
        category: listing.category,
      }
    : {};

  return (
    <div className="form-page">
      <div className="form-page__card">
        <h1 className="form-page__title">Edit Listing</h1>

        {/* Current image preview */}
        {listing?.image?.url && (
          <div className="edit-image-preview">
            <p className="form-label">Current Image</p>
            <img
              src={listing.image.url.replace("/upload", "/upload/w_400")}
              alt={listing.title}
              className="edit-image-preview__img"
            />
          </div>
        )}

        <ListingForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
