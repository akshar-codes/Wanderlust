import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, Star, MapPin, Users, BedDouble, Bath, Check } from "lucide-react";
import { useListing } from "../../hooks/useListings";
import Spinner from "../../components/common/Spinner";
import WishlistHeartButton from "../../components/wishlist/WishlistHeartButton";
import MobileListingGallery from "../../components/mobile/MobileListingGallery";
import MobileBookingFlow from "../../components/mobile/MobileBookingFlow";
import ListingMap from "../../components/map/ListingMap";
import ReviewsSection from "../../components/reviews/ReviewsSection";
import { brand, neutral, radii } from "../../theme/tokens";

/**
 * Mobile-optimized listing detail screen: swipeable gallery up top, compact
 * info sections, and a sticky bottom "Reserve" bar that opens the full
 * MobileBookingFlow sheet — replaces the desktop sidebar BookingWidget,
 * which doesn't fit a narrow viewport. Reuses ReviewsSection and ListingMap
 * as-is so review/map behavior stays identical across breakpoints.
 */
export default function MobileListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: listing, isLoading, isError } = useListing(id);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <Spinner size={36} />
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <p style={{ fontWeight: 700, color: neutral[800] }}>Listing not found</p>
      </div>
    );
  }

  const images = listing.images?.length
    ? listing.images
    : listing.image?.url
      ? [{ url: listing.image.url }]
      : [];

  const amenities = listing.amenities ?? [];
  const nightlyPrice = listing.pricing?.nightlyPrice ?? listing.price ?? 0;

  return (
    <div style={{ paddingBottom: 96 }}>
      <div style={{ position: "relative" }}>
        <MobileListingGallery images={images} title={listing.title} />
        <div
          style={{
            position: "absolute",
            top: "calc(env(safe-area-inset-top, 0px) + 12px)",
            left: 14,
            right: 14,
            display: "flex",
            justifyContent: "space-between",
            zIndex: 5,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.92)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            }}
          >
            <ArrowLeft size={18} color={neutral[800]} />
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => navigator.share?.({ title: listing.title, url: window.location.href }).catch(() => {})}
              aria-label="Share"
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.92)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
              }}
            >
              <Share2 size={16} color={neutral[800]} />
            </button>
            <WishlistHeartButton listingId={listing._id} size={38} iconSize={16} />
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 16px 0" }}>
        <span
          style={{
            background: "rgba(255,90,95,0.1)",
            color: brand[600],
            borderRadius: 999,
            padding: "3px 10px",
            fontSize: "0.6875rem",
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {listing.category}
        </span>
        <h1
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "1.5rem",
            lineHeight: 1.2,
            color: neutral[800],
            margin: "10px 0 8px",
          }}
        >
          {listing.title}
        </h1>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          {listing.averageRating > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Star size={13} fill="#f59e0b" stroke="none" />
              <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{Number(listing.averageRating).toFixed(1)}</span>
              <span style={{ fontSize: "0.875rem", color: neutral[500] }}>· {listing.reviewCount} reviews</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={13} color={neutral[400]} />
            <span style={{ fontSize: "0.875rem", color: neutral[600] }}>
              {listing.location}, {listing.country}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "18px 0", borderBottom: `1px solid ${neutral[200]}`, marginBottom: 24 }}>
          {[
            { icon: <Users size={15} />, label: `${listing.maxGuests ?? 2} guests` },
            { icon: <BedDouble size={15} />, label: `${listing.bedrooms ?? 1} bed${listing.bedrooms === 1 ? "" : "s"}` },
            { icon: <Bath size={15} />, label: `${listing.bathrooms ?? 1} bath${listing.bathrooms === 1 ? "" : "s"}` },
          ].map(({ icon, label }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 12px",
                background: neutral[50],
                border: `1px solid ${neutral[200]}`,
                borderRadius: 10,
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: neutral[700],
                flexShrink: 0,
              }}
            >
              <span style={{ color: brand[500] }}>{icon}</span>
              {label}
            </div>
          ))}
        </div>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.2rem", color: neutral[800], marginBottom: 10 }}>
            About this place
          </h2>
          <p style={{ fontSize: "0.9375rem", lineHeight: 1.7, color: neutral[600], margin: 0 }}>{listing.description}</p>
        </section>

        {amenities.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.2rem", color: neutral[800], marginBottom: 14 }}>
              What this place offers
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(showAllAmenities ? amenities : amenities.slice(0, 6)).map((key) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.875rem", color: neutral[700] }}>
                  <Check size={16} color={neutral[500]} />
                  {key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </div>
              ))}
            </div>
            {amenities.length > 6 && (
              <button
                onClick={() => setShowAllAmenities((s) => !s)}
                style={{
                  marginTop: 14,
                  padding: "10px 20px",
                  border: `1.5px solid ${neutral[300]}`,
                  borderRadius: 999,
                  background: "#fff",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  color: neutral[700],
                  cursor: "pointer",
                }}
              >
                {showAllAmenities ? "Show less" : `Show all ${amenities.length} amenities`}
              </button>
            )}
          </section>
        )}

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.2rem", color: neutral[800], marginBottom: 10 }}>
            Where you'll be
          </h2>
          <div style={{ borderRadius: radii.xl, overflow: "hidden", border: `1px solid ${neutral[200]}`, height: 240 }}>
            <ListingMap coordinates={listing.geometry?.coordinates} title={listing.title} />
          </div>
        </section>

        <ReviewsSection listingId={listing._id} listingOwnerId={listing.owner?._id ?? listing.owner} />
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "12px 16px calc(env(safe-area-inset-bottom, 0px) + 12px)",
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(16px)",
          borderTop: `1px solid ${neutral[200]}`,
        }}
      >
        <div>
          <span style={{ fontWeight: 700, fontSize: "1.05rem", color: neutral[800] }}>
            ₹{nightlyPrice.toLocaleString("en-IN")}
          </span>
          <span style={{ fontSize: "0.8125rem", color: neutral[500] }}> / night</span>
        </div>
        <button
          onClick={() => setBookingOpen(true)}
          style={{
            padding: "13px 32px",
            background: `linear-gradient(135deg, ${brand[500]}, ${brand[600]})`,
            border: "none",
            borderRadius: 999,
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.9375rem",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(255,90,95,0.32)",
          }}
        >
          Reserve
        </button>
      </div>

      <MobileBookingFlow open={bookingOpen} onClose={() => setBookingOpen(false)} listing={listing} />
    </div>
  );
}
