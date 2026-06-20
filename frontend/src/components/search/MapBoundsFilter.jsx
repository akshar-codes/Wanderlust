import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, RefreshCw, X } from "lucide-react";

// ─── Marker cluster (simple, no external dep) ────────────────────────────────
// Each visible listing gets a price pill pin on the map.

const MAPBOX_STYLE = "mapbox://styles/mapbox/light-v11";

export default function MapBoundsFilter({
  bounds = null,
  onBoundsChange,
  listings = [],
  height = 500,
  className,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [hasMoved, setHasMoved] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [tokenMissing, setTokenMissing] = useState(false);

  // ── Initialise map ──────────────────────────────────────────────────────
  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) {
      setTokenMissing(true);
      return;
    }

    let mapboxgl;
    import("mapbox-gl").then(({ default: mgl }) => {
      mapboxgl = mgl;
      mapboxgl.accessToken = token;

      if (!containerRef.current || mapRef.current) return;

      mapRef.current = new mapboxgl.Map({
        container: containerRef.current,
        style: MAPBOX_STYLE,
        center: [78.9629, 20.5937], // default: India
        zoom: 4,
      });

      mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");
      mapRef.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
        }),
        "top-right",
      );

      mapRef.current.on("load", () => setMapReady(true));

      // Track user-initiated moves (not programmatic)
      let isMoving = false;
      mapRef.current.on("movestart", (e) => {
        if (e.originalEvent) isMoving = true;
      });
      mapRef.current.on("moveend", () => {
        if (isMoving) {
          setHasMoved(true);
          isMoving = false;
        }
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Fit to existing bounds ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !bounds || !mapReady) return;
    const { sw, ne } = bounds;
    mapRef.current.fitBounds(
      [
        [sw.lng, sw.lat],
        [ne.lng, ne.lat],
      ],
      { padding: 40, duration: 600 },
    );
    setHasMoved(false);
  }, [bounds, mapReady]);

  // ── Update listing pins ─────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    import("mapbox-gl").then(({ default: mapboxgl }) => {
      // Clear old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      listings.forEach((listing) => {
        const [lng, lat] = listing.geometry?.coordinates ?? [];
        if (!lng || !lat) return;

        const el = document.createElement("div");
        el.style.cssText = `
          background: #fff;
          border: 2px solid #ff5a5f;
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #261f1a;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.14);
          transition: transform 0.15s, background 0.15s;
        `;
        el.textContent = `₹${Math.round(listing.price / 100)}K`;
        el.title = listing.title;

        el.addEventListener("mouseenter", () => {
          el.style.background = "#ff5a5f";
          el.style.color = "#fff";
          el.style.transform = "scale(1.08)";
        });
        el.addEventListener("mouseleave", () => {
          el.style.background = "#fff";
          el.style.color = "#261f1a";
          el.style.transform = "scale(1)";
        });

        const popup = new mapboxgl.Popup({ offset: 24, closeButton: false })
          .setHTML(`
            <div style="padding:4px 0;font-family:'Plus Jakarta Sans',sans-serif">
              <strong style="font-size:13px;color:#261f1a">${listing.title}</strong><br>
              <span style="font-size:12px;color:#8a8179">${listing.location}, ${listing.country}</span><br>
              <span style="font-size:13px;font-weight:700;color:#ff5a5f">
                ₹${listing.price?.toLocaleString("en-IN")} / night
              </span>
            </div>
          `);

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(mapRef.current);

        markersRef.current.push(marker);
      });
    });
  }, [listings, mapReady]);

  // ── "Search this area" handler ──────────────────────────────────────────
  const handleSearchArea = useCallback(() => {
    if (!mapRef.current) return;
    const b = mapRef.current.getBounds();
    const newBounds = {
      sw: { lat: b.getSouth(), lng: b.getWest() },
      ne: { lat: b.getNorth(), lng: b.getEast() },
    };
    onBoundsChange?.(newBounds);
    setHasMoved(false);
  }, [onBoundsChange]);

  const clearBounds = useCallback(() => {
    onBoundsChange?.(null);
    setHasMoved(false);
  }, [onBoundsChange]);

  // ── Token missing fallback ─────────────────────────────────────────────
  if (tokenMissing) {
    return (
      <div
        style={{
          height,
          borderRadius: 20,
          background: "linear-gradient(135deg, #f4f1ee, #ebe7e3)",
          border: "1.5px solid #d6d0ca",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          color: "#8a8179",
        }}
        className={className}
      >
        <Map size={32} strokeWidth={1.5} />
        <div style={{ textAlign: "center" }}>
          <p style={{ fontWeight: 600, color: "#3d3630", marginBottom: 4 }}>
            Map unavailable
          </p>
          <p style={{ fontSize: "0.8125rem" }}>
            Add{" "}
            <code
              style={{
                background: "#fff",
                padding: "2px 6px",
                borderRadius: 4,
              }}
            >
              VITE_MAPBOX_TOKEN
            </code>{" "}
            to .env.local
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        height,
        borderRadius: 20,
        overflow: "hidden",
      }}
      className={className}
    >
      {/* Map container */}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Control overlay */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        {/* Search this area button */}
        <AnimatePresence>
          {hasMoved && (
            <motion.button
              initial={{ opacity: 0, y: -12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={handleSearchArea}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "10px 18px",
                background: "#fff",
                border: "1.5px solid rgba(230,224,218,0.8)",
                borderRadius: 999,
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "#261f1a",
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 4px 20px rgba(0,0,0,0.14)",
                backdropFilter: "blur(8px)",
              }}
            >
              <RefreshCw size={14} color="#ff5a5f" />
              Search this area
            </motion.button>
          )}
        </AnimatePresence>

        {/* Clear bounds button */}
        <AnimatePresence>
          {bounds && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={clearBounds}
              title="Clear map filter"
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.95)",
                border: "1.5px solid rgba(230,224,218,0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
              }}
            >
              <X size={15} color="#5c544c" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Listing count pill */}
      {listings.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(38,31,26,0.82)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            borderRadius: 999,
            padding: "6px 16px",
            fontSize: "0.8125rem",
            fontWeight: 600,
            fontFamily: "inherit",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {listings.length} {listings.length === 1 ? "stay" : "stays"} in this
          area
        </div>
      )}
    </div>
  );
}
