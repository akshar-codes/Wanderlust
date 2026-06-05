import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import { useListings } from "../hooks/useListings";
import ListingCard from "../components/listings/ListingCard";
import CategoryFilters from "../components/listings/CategoryFilters";
import Spinner from "../components/common/Spinner";

export default function ListingsPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || undefined;
  const [showTax, setShowTax] = useState(false);

  // Shared search/filter state from AppLayout
  const {
    searchQuery = "",
    selectedCountry = "",
    setAvailableCountries,
  } = useOutletContext() || {};

  const { data, isLoading, isError, error } = useListings({ category });
  const listings = data?.listings || [];

  // Populate country dropdown in Navbar
  useEffect(() => {
    if (listings.length > 0) {
      const countries = [...new Set(listings.map((l) => l.country))].sort();
      setAvailableCountries?.(countries);
    }
  }, [listings, setAvailableCountries]);

  // Client-side filter (search + country)
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return listings.filter((l) => {
      const matchesSearch =
        !q ||
        l.title.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        l.country.toLowerCase().includes(q);
      const matchesCountry = !selectedCountry || l.country === selectedCountry;
      return matchesSearch && matchesCountry;
    });
  }, [listings, searchQuery, selectedCountry]);

  if (isLoading) {
    return (
      <div className="center-screen">
        <Spinner size={42} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="error-banner">
        <p>Failed to load listings: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="listings-page">
      <CategoryFilters showTax={showTax} onTaxToggle={setShowTax} />

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__message">No listings found.</p>
        </div>
      ) : (
        <div className="listings-grid">
          {filtered.map((listing) => (
            <ListingCard
              key={listing._id}
              listing={listing}
              showTax={showTax}
            />
          ))}
        </div>
      )}
    </div>
  );
}
