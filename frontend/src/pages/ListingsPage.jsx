import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useListings } from "../hooks/useListings";
import ListingCard from "../components/listings/ListingCard";
import CategoryFilters from "../components/listings/CategoryFilters";
import {
  ListingsGridSkeleton,
  EmptyState,
  ErrorBanner,
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "../components/common/GlobalStates";

export default function ListingsPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || undefined;
  const [showTax, setShowTax] = useState(false);

  const {
    searchQuery = "",
    selectedCountry = "",
    setAvailableCountries,
  } = useOutletContext() || {};

  const { data, isLoading, isError, error, refetch } = useListings({
    category,
  });
  const listings = data?.listings || [];

  useEffect(() => {
    if (listings.length > 0) {
      const countries = [...new Set(listings.map((l) => l.country))].sort();
      setAvailableCountries?.(countries);
    }
  }, [listings, setAvailableCountries]);

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

  return (
    <div style={{ paddingTop: 8 }}>
      <ScrollReveal direction="down" delay={0.05}>
        <CategoryFilters showTax={showTax} onTaxToggle={setShowTax} />
      </ScrollReveal>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ListingsGridSkeleton count={8} />
          </motion.div>
        ) : isError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ErrorBanner
              message={error?.message || "Failed to load listings"}
              onRetry={refetch}
            />
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState
              variant={searchQuery || selectedCountry ? "search" : "listings"}
              action={
                (searchQuery || selectedCountry || category) && (
                  <a
                    href="/listings"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "10px 22px",
                      background: "linear-gradient(135deg, #ff5a5f, #e84040)",
                      borderRadius: 999,
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      textDecoration: "none",
                      boxShadow: "0 4px 16px rgba(255,90,95,0.3)",
                    }}
                  >
                    Clear filters
                  </a>
                )
              }
            />
          </motion.div>
        ) : (
          <motion.div
            key="listings"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StaggerContainer
              staggerDelay={0.06}
              style={{
                display: "grid",
                gap: "28px 20px",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              }}
            >
              {filtered.map((listing) => (
                <StaggerItem key={listing._id}>
                  <ListingCard listing={listing} showTax={showTax} />
                </StaggerItem>
              ))}
            </StaggerContainer>

            {/* Results count */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ textAlign: "center", marginTop: 40 }}
            >
              <p style={{ fontSize: "0.8125rem", color: "#b8b0a8" }}>
                Showing{" "}
                <strong style={{ color: "#5c544c" }}>{filtered.length}</strong>{" "}
                of{" "}
                <strong style={{ color: "#5c544c" }}>{listings.length}</strong>{" "}
                listings
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
