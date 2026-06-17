import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useListings } from "../hooks/useListings";

// ─── Inline styles injected once ─────────────────────────────────────────────
const GLOBAL_CSS = `

  .hp-root {
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    color: #1a1410;
    background: #fdfcfb;
    overflow-x: hidden;
  }

  /* ── Keyframes ── */
  @keyframes hp-fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes hp-shimmer {
    0%   { background-position: -800px 0; }
    100% { background-position:  800px 0; }
  }
  @keyframes hp-pulse-dot {
    0%, 100% { transform: scale(1); opacity: 1; }
    50%       { transform: scale(1.4); opacity: 0.6; }
  }
  @keyframes hp-ticker {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes hp-float {
    0%, 100% { transform: translateY(0px) rotate(-1deg); }
    50%       { transform: translateY(-10px) rotate(1deg); }
  }
  @keyframes hp-gradient-shift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* ── Skeleton ── */
  .hp-skeleton {
    background: linear-gradient(90deg, #f0ece4 25%, #e6e1d9 50%, #f0ece4 75%);
    background-size: 800px 100%;
    animation: hp-shimmer 1.5s ease-in-out infinite;
    border-radius: 12px;
  }

  /* ── Scrollbar hide ── */
  .hp-scroll-hide { scrollbar-width: none; }
  .hp-scroll-hide::-webkit-scrollbar { display: none; }

  /* ── Section fade-in ── */
  .hp-reveal {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .hp-reveal.is-visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
`;

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  coral: "#FF5A5F",
  coralDark: "#E04E53",
  coralLight: "#FFF0F0",
  coralGlow: "rgba(255,90,95,0.22)",
  teal: "#0D9488",
  navy: "#1a1410",
  navyLight: "#2d2520",
  warmWhite: "#FDFCFB",
  sand: "#F7F4EF",
  sandDark: "#EDE9E2",
  slate: "#6B7280",
  slateLight: "#9CA3AF",
  gold: "#F59E0B",
  border: "#E8E3DC",
  green: "#10B981",
};

const FONT_DISPLAY = "'Cormorant Garamond', Georgia, serif";
const FONT_BODY = "'Plus Jakarta Sans', system-ui, sans-serif";

// ─── Static data ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: null, icon: "✦", label: "All" },
  { key: "trending", icon: "🔥", label: "Trending" },
  { key: "rooms", icon: "🛏", label: "Rooms" },
  { key: "iconic", icon: "🏙", label: "Iconic" },
  { key: "mountains", icon: "⛰", label: "Mountains" },
  { key: "castles", icon: "🏰", label: "Castles" },
  { key: "pools", icon: "🏊", label: "Pools" },
  { key: "camping", icon: "⛺", label: "Camping" },
  { key: "farms", icon: "🐄", label: "Farms" },
  { key: "arctic", icon: "❄️", label: "Arctic" },
  { key: "domes", icon: "🛖", label: "Domes" },
  { key: "boats", icon: "⛵", label: "Boats" },
];

const DESTINATIONS = [
  {
    city: "Santorini",
    country: "Greece",
    tag: "Most loved",
    stays: "240+",
    img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=700&q=80",
    color: "#2563EB",
  },
  {
    city: "Kyoto",
    country: "Japan",
    tag: "Hidden gem",
    stays: "185+",
    img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=700&q=80",
    color: "#7C3AED",
  },
  {
    city: "Tuscany",
    country: "Italy",
    tag: "Romantic",
    stays: "320+",
    img: "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=700&q=80",
    color: "#D97706",
  },
  {
    city: "Bali",
    country: "Indonesia",
    tag: "Trending",
    stays: "410+",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=700&q=80",
    color: "#059669",
  },
  {
    city: "Patagonia",
    country: "Argentina",
    tag: "Wild",
    stays: "90+",
    img: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=700&q=80",
    color: "#0369A1",
  },
];

const EXPERIENCES = [
  {
    title: "Sunset Sailing",
    location: "Amalfi Coast, Italy",
    duration: "3 hours",
    price: 4200,
    rating: 4.97,
    reviews: 312,
    img: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=600&q=80",
  },
  {
    title: "Truffle Hunting",
    location: "Périgord, France",
    duration: "Half day",
    price: 6800,
    rating: 4.95,
    reviews: 189,
    img: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=600&q=80",
  },
  {
    title: "Northern Lights",
    location: "Tromsø, Norway",
    duration: "Full night",
    price: 8500,
    rating: 4.98,
    reviews: 524,
    img: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80",
  },
  {
    title: "Rice Paddy Walk",
    location: "Ubud, Bali",
    duration: "4 hours",
    price: 2100,
    rating: 4.92,
    reviews: 847,
    img: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&q=80",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    location: "Mumbai, India",
    avatar: "P",
    avatarColor: "#7C3AED",
    text: "We booked a cliffside villa in Santorini through Wanderlust and it exceeded every expectation. The host was exceptional, the property was stunning, and the whole experience felt effortless.",
    property: "Cliffside Villa · Santorini",
    rating: 5,
    date: "March 2025",
  },
  {
    name: "James Okafor",
    location: "London, UK",
    avatar: "J",
    avatarColor: "#0369A1",
    text: "I've used every major booking platform and Wanderlust is categorically different. The curation is impeccable — no filler properties, just places with genuine character.",
    property: "Kyoto Machiya · Japan",
    rating: 5,
    date: "January 2025",
  },
  {
    name: "Elena Vasquez",
    location: "Barcelona, Spain",
    avatar: "E",
    avatarColor: "#059669",
    text: "The Northern Lights experience they recommended changed my life. The guide was knowledgeable, the conditions were perfect, and the photos I got were magazine-worthy.",
    property: "Aurora Glamping · Norway",
    rating: 5,
    date: "February 2025",
  },
];

const TICKER_ITEMS = [
  "10,000+ verified properties",
  "180 countries",
  "Trusted by millions",
  "Best price guarantee",
  "Instant confirmation",
  "24/7 support",
  "No hidden fees",
  "Superhost network",
];

// ─── Framer Motion variants ───────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

// ─── Reveal wrapper ───────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, style }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeUp}
      custom={delay}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ─── Section title component ──────────────────────────────────────────────────
function SectionTitle({ eyebrow, title, subtitle, center = false }) {
  return (
    <div style={{ textAlign: center ? "center" : "left", marginBottom: 40 }}>
      {eyebrow && (
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: C.coral,
            marginBottom: 10,
          }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: "clamp(1.9rem, 3.2vw, 2.8rem)",
          fontWeight: 400,
          lineHeight: 1.12,
          color: C.navy,
          letterSpacing: "-0.01em",
          marginBottom: subtitle ? 12 : 0,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: "1rem",
            color: C.slate,
            lineHeight: 1.65,
            maxWidth: center ? 520 : "none",
            marginInline: center ? "auto" : undefined,
            fontWeight: 400,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─── Star rating ──────────────────────────────────────────────────────────────
function Stars({ rating, size = 13 }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={i <= Math.round(rating) ? C.gold : "#E5E7EB"}
            stroke="none"
          />
        </svg>
      ))}
    </span>
  );
}

// ─── Skeleton variants ────────────────────────────────────────────────────────
function ListingCardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        className="hp-skeleton"
        style={{ aspectRatio: "4/3", borderRadius: 18 }}
      />
      <div
        style={{
          padding: "0 2px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div
          className="hp-skeleton"
          style={{ height: 12, width: "40%", borderRadius: 6 }}
        />
        <div
          className="hp-skeleton"
          style={{ height: 18, width: "75%", borderRadius: 6 }}
        />
        <div
          className="hp-skeleton"
          style={{ height: 13, width: "55%", borderRadius: 6 }}
        />
      </div>
    </div>
  );
}

// ─── Listing Card ─────────────────────────────────────────────────────────────
function ListingCard({ listing, index }) {
  const [saved, setSaved] = useState(false);
  const { _id, title, location, country, price, image, category } = listing;
  const seed = _id ? parseInt(_id.slice(-4), 16) : index;
  const rating = (4.2 + (seed % 9) * 0.09).toFixed(1);
  const reviews = 18 + (seed % 120);
  const catIcon = CATEGORIES.find((c) => c.key === category)?.icon ?? "🏠";

  return (
    <motion.div
      variants={fadeUp}
      custom={index * 0.5}
      whileHover="hover"
      initial="rest"
      animate="rest"
    >
      <Link
        to={`/listings/${_id}`}
        style={{ textDecoration: "none", color: "inherit", display: "block" }}
      >
        {/* Image */}
        <div
          style={{
            position: "relative",
            borderRadius: 18,
            overflow: "hidden",
            aspectRatio: "4/3",
            background: "#f0ece4",
          }}
        >
          <motion.img
            variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            src={image?.url}
            alt={title}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />

          {/* Gradient fade bottom */}
          <motion.div
            variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(26,20,16,0.4) 0%, transparent 55%)",
            }}
          />

          {/* Category badge */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: "rgba(255,255,255,0.93)",
              backdropFilter: "blur(10px)",
              borderRadius: 999,
              padding: "4px 11px",
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: "0.72rem",
              fontWeight: 700,
              color: C.navy,
              letterSpacing: "0.03em",
            }}
          >
            <span>{catIcon}</span>
            <span style={{ textTransform: "capitalize" }}>
              {category || "Stay"}
            </span>
          </div>

          {/* Save button */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.88 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSaved((s) => !s);
            }}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: saved
                ? "rgba(255,90,95,0.12)"
                : "rgba(255,255,255,0.93)",
              backdropFilter: "blur(10px)",
              border: saved ? "1.5px solid rgba(255,90,95,0.35)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            }}
            aria-label={saved ? "Remove from wishlist" : "Save"}
          >
            <svg width={15} height={15} viewBox="0 0 24 24">
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                fill={saved ? C.coral : "none"}
                stroke={saved ? C.coral : C.navy}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </svg>
          </motion.button>
        </div>

        {/* Body */}
        <div style={{ padding: "12px 2px 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 4,
            }}
          >
            <svg
              width={11}
              height={11}
              viewBox="0 0 24 24"
              fill="none"
              stroke={C.slateLight}
              strokeWidth={2.5}
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                color: C.slateLight,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              {location}, {country}
            </span>
          </div>
          <h3
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "1.05rem",
              fontWeight: 400,
              color: C.navy,
              lineHeight: 1.3,
              marginBottom: 8,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title}
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  color: C.navy,
                }}
              >
                ₹{price?.toLocaleString("en-IN")}
              </span>
              <span style={{ color: C.slate, fontSize: "0.8rem" }}>
                {" "}
                / night
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Stars rating={parseFloat(rating)} />
              <span
                style={{ fontSize: "0.8rem", fontWeight: 600, color: C.navy }}
              >
                {rating}
              </span>
              <span style={{ fontSize: "0.72rem", color: C.slateLight }}>
                ({reviews})
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Experience Card ──────────────────────────────────────────────────────────
function ExperienceCard({ exp, index }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index * 0.5}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: "#fff",
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: "0 2px 12px rgba(26,20,16,0.06)",
        transition: "box-shadow 0.25s",
      }}
    >
      {/* Image */}
      <div
        style={{ position: "relative", overflow: "hidden", aspectRatio: "3/2" }}
      >
        <img
          src={exp.img}
          alt={exp.title}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "transform 0.5s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.04)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            background: "rgba(26,20,16,0.72)",
            backdropFilter: "blur(8px)",
            borderRadius: 999,
            padding: "4px 12px",
            fontSize: "0.72rem",
            fontWeight: 600,
            color: "#fff",
            letterSpacing: "0.04em",
          }}
        >
          {exp.duration}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "18px 20px 20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 6,
          }}
        >
          <h3
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "1.15rem",
              fontWeight: 400,
              color: C.navy,
              lineHeight: 1.25,
              flex: 1,
            }}
          >
            {exp.title}
          </h3>
        </div>
        <p
          style={{
            fontSize: "0.8rem",
            color: C.slate,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <svg
            width={11}
            height={11}
            viewBox="0 0 24 24"
            fill="none"
            stroke={C.slateLight}
            strokeWidth={2.5}
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {exp.location}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 12,
            borderTop: `1px solid ${C.border}`,
          }}
        >
          <div>
            <span
              style={{ fontWeight: 700, fontSize: "0.95rem", color: C.navy }}
            >
              ₹{exp.price.toLocaleString("en-IN")}
            </span>
            <span style={{ color: C.slate, fontSize: "0.78rem" }}>
              {" "}
              / person
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Stars rating={exp.rating} />
            <span
              style={{ fontSize: "0.8rem", fontWeight: 700, color: C.navy }}
            >
              {exp.rating}
            </span>
            <span style={{ fontSize: "0.72rem", color: C.slateLight }}>
              ({exp.reviews})
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Destination Card ─────────────────────────────────────────────────────────
function DestinationCard({ dest, index, isLarge }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index * 0.6}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "relative",
        borderRadius: isLarge ? 24 : 20,
        overflow: "hidden",
        cursor: "pointer",
        height: isLarge ? "100%" : undefined,
        aspectRatio: isLarge ? undefined : "4/3",
      }}
    >
      <Link
        to={`/listings?q=${dest.city}`}
        style={{ display: "block", height: "100%" }}
      >
        <img
          src={dest.img}
          alt={dest.city}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "transform 0.5s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />

        {/* Gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(26,20,16,0.82) 0%, rgba(26,20,16,0.2) 50%, transparent 100%)",
          }}
        />

        {/* Tag */}
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 999,
            padding: "4px 13px",
            fontSize: "0.7rem",
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {dest.tag}
        </div>

        {/* Info */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: isLarge ? "28px 24px" : "20px 18px",
          }}
        >
          <h3
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: isLarge ? "2rem" : "1.4rem",
              fontWeight: 400,
              color: "#fff",
              lineHeight: 1.1,
              marginBottom: 5,
            }}
          >
            {dest.city}
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.75)" }}>
              {dest.country} · {dest.stays} stays
            </p>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width={13}
                height={13}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth={2.5}
                strokeLinecap="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Testimonial Card ─────────────────────────────────────────────────────────
function TestimonialCard({ t, index }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index * 0.5}
      style={{
        background: "#fff",
        border: `1px solid ${C.border}`,
        borderRadius: 22,
        padding: "28px 28px 26px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        boxShadow: "0 4px 24px rgba(26,20,16,0.06)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Quote mark */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 24,
          fontFamily: FONT_DISPLAY,
          fontSize: "5rem",
          lineHeight: 1,
          color: "rgba(255,90,95,0.08)",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        "
      </div>

      {/* Stars */}
      <Stars rating={t.rating} size={15} />

      {/* Text */}
      <p
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: "1.05rem",
          fontWeight: 300,
          lineHeight: 1.7,
          color: C.navy,
          fontStyle: "italic",
          flex: 1,
        }}
      >
        "{t.text}"
      </p>

      {/* Property chip */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 12px",
          background: C.coralLight,
          borderRadius: 999,
          fontSize: "0.72rem",
          fontWeight: 700,
          color: C.coralDark,
          letterSpacing: "0.03em",
          alignSelf: "flex-start",
        }}
      >
        <svg
          width={11}
          height={11}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        </svg>
        {t.property}
      </div>

      {/* Author */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          paddingTop: 12,
          borderTop: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: t.avatarColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT_DISPLAY,
            fontSize: "1.1rem",
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {t.avatar}
        </div>
        <div>
          <p
            style={{
              fontWeight: 700,
              fontSize: "0.875rem",
              color: C.navy,
              marginBottom: 1,
            }}
          >
            {t.name}
          </p>
          <p style={{ fontSize: "0.75rem", color: C.slate }}>
            {t.location} · {t.date}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Hero Search ─────────────────────────────────────────────────────────
function HeroSearch({ listings }) {
  const navigate = useNavigate();
  const [where, setWhere] = useState("");
  const [category, setCategory] = useState("");
  const [focused, setFocused] = useState(null); // "where" | "when" | "guests"
  const [when, setWhen] = useState("");
  const [guests, setGuests] = useState("1 guest");

  const countries = useMemo(
    () => [...new Set(listings.map((l) => l.country))].sort().filter(Boolean),
    [listings],
  );

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (where) p.set("q", where);
    if (category) p.set("category", category);
    navigate(`/listings?${p}`);
  };

  const fieldStyle = (key) => ({
    flex: 1,
    padding: "16px 22px",
    borderRight: key !== "guests" ? `1px solid ${C.border}` : "none",
    cursor: "text",
    background: focused === key ? "#fff" : "transparent",
    transition: "background 0.2s",
  });

  return (
    <div style={{ width: "100%", maxWidth: 860, margin: "0 auto" }}>
      <form onSubmit={handleSearch}>
        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            border: `1.5px solid ${C.border}`,
            boxShadow:
              "0 20px 60px rgba(26,20,16,0.14), 0 4px 16px rgba(26,20,16,0.08)",
            overflow: "hidden",
            display: "flex",
            alignItems: "stretch",
          }}
        >
          {/* WHERE */}
          <div style={fieldStyle("where")} onClick={() => setFocused("where")}>
            <p
              style={{
                fontSize: "0.65rem",
                fontWeight: 800,
                letterSpacing: "0.12em",
                color: C.navy,
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Where
            </p>
            <input
              type="text"
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              onFocus={() => setFocused("where")}
              onBlur={() => setFocused(null)}
              placeholder="Search destinations"
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontFamily: FONT_BODY,
                fontSize: "0.9rem",
                color: C.navy,
                width: "100%",
                padding: 0,
              }}
            />
          </div>

          {/* WHEN */}
          <div style={fieldStyle("when")} onClick={() => setFocused("when")}>
            <p
              style={{
                fontSize: "0.65rem",
                fontWeight: 800,
                letterSpacing: "0.12em",
                color: C.navy,
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              When
            </p>
            <input
              type="text"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              onFocus={() => setFocused("when")}
              onBlur={() => setFocused(null)}
              placeholder="Add dates"
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontFamily: FONT_BODY,
                fontSize: "0.9rem",
                color: C.navy,
                width: "100%",
                padding: 0,
              }}
            />
          </div>

          {/* GUESTS */}
          <div
            style={fieldStyle("guests")}
            onClick={() => setFocused("guests")}
          >
            <p
              style={{
                fontSize: "0.65rem",
                fontWeight: 800,
                letterSpacing: "0.12em",
                color: C.navy,
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Who
            </p>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              onFocus={() => setFocused("guests")}
              onBlur={() => setFocused(null)}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontFamily: FONT_BODY,
                fontSize: "0.9rem",
                color: C.navy,
                width: "100%",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {["1 guest", "2 guests", "3 guests", "4 guests", "5+ guests"].map(
                (g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ),
              )}
            </select>
          </div>

          {/* Search button */}
          <div
            style={{
              padding: "10px 10px 10px 4px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="submit"
              style={{
                background: `linear-gradient(135deg, ${C.coral} 0%, ${C.coralDark} 100%)`,
                border: "none",
                borderRadius: 16,
                width: 52,
                height: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(255,90,95,0.4)",
                flexShrink: 0,
              }}
              aria-label="Search"
            >
              <svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth={2.5}
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Quick filters */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 14,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {CATEGORIES.filter((c) => c.key)
            .slice(0, 6)
            .map((c) => (
              <motion.button
                key={c.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() =>
                  setCategory((prev) => (prev === c.key ? "" : c.key))
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "7px 14px",
                  borderRadius: 999,
                  border: `1.5px solid ${category === c.key ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)"}`,
                  background:
                    category === c.key
                      ? "rgba(255,255,255,0.25)"
                      : "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                  color: "#fff",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: FONT_BODY,
                  transition: "all 0.15s",
                }}
              >
                <span>{c.icon}</span>
                <span>{c.label}</span>
              </motion.button>
            ))}
        </div>
      </form>
    </div>
  );
}

// ─── SECTION 1: Hero ──────────────────────────────────────────────────────────
function HeroSection({ listings }) {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "92vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Background */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {/* Main bg image */}
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=80"
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            filter: "brightness(0.65)",
          }}
        />
        {/* Tonal overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(165deg, rgba(26,20,16,0.7) 0%, rgba(26,20,16,0.3) 50%, rgba(26,20,16,0.6) 100%)",
          }}
        />
        {/* Bottom fade for section continuity */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 200,
            background: "linear-gradient(to top, #fdfcfb 0%, transparent 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 1200,
          padding: "120px 32px 80px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              marginBottom: 28,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: C.coral,
                animation: "hp-pulse-dot 2s ease infinite",
              }}
            />
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              Over 10,000 verified properties worldwide
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: "clamp(3rem, 7vw, 6rem)",
            fontWeight: 300,
            color: "#fff",
            lineHeight: 1.06,
            letterSpacing: "-0.015em",
            marginBottom: 20,
            maxWidth: 820,
          }}
        >
          Where will your{" "}
          <em style={{ fontStyle: "italic", color: C.coral }}>next story</em>{" "}
          begin?
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          style={{
            fontFamily: FONT_BODY,
            fontSize: "1.05rem",
            color: "rgba(255,255,255,0.75)",
            fontWeight: 300,
            lineHeight: 1.65,
            maxWidth: 480,
            marginBottom: 48,
          }}
        >
          Handpicked homes, villas, and unique stays in 180+ countries — curated
          for those who travel with intention.
        </motion.p>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.45 }}
          style={{ width: "100%", maxWidth: 860 }}
        >
          <HeroSearch listings={listings} />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          style={{
            display: "flex",
            gap: 40,
            marginTop: 52,
            paddingTop: 36,
            borderTop: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {[
            ["10K+", "Properties"],
            ["180+", "Countries"],
            ["4.95★", "Avg. Rating"],
            ["2M+", "Happy guests"],
          ].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <p
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: "1.8rem",
                  color: "#fff",
                  lineHeight: 1,
                  marginBottom: 4,
                  fontWeight: 400,
                }}
              >
                {n}
              </p>
              <p
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {l}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── SECTION 2: Categories ────────────────────────────────────────────────────
function CategoriesSection({ activeCategory, setActiveCategory }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current)
      scrollRef.current.scrollBy({ left: dir * 240, behavior: "smooth" });
  };

  return (
    <Reveal>
      <section
        style={{
          background: C.sand,
          padding: "52px 0 44px",
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Left scroll */}
            <motion.button
              whileHover={{ scale: 1.08, background: "#fff" }}
              whileTap={{ scale: 0.93 }}
              onClick={() => scroll(-1)}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "#fff",
                border: `1.5px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(26,20,16,0.07)",
              }}
              aria-label="Scroll left"
            >
              <svg
                width={14}
                height={14}
                viewBox="0 0 24 24"
                fill="none"
                stroke={C.slate}
                strokeWidth={2.5}
                strokeLinecap="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </motion.button>

            {/* Scroll container */}
            <div
              ref={scrollRef}
              className="hp-scroll-hide"
              style={{
                display: "flex",
                gap: 10,
                flex: 1,
                overflowX: "auto",
                paddingBottom: 2,
              }}
            >
              {CATEGORIES.map(({ key, icon, label }, i) => {
                const active = activeCategory === key;
                return (
                  <motion.button
                    key={label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveCategory(key)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 7,
                      padding: "14px 20px",
                      borderRadius: 18,
                      border: `1.5px solid ${active ? C.navy : "transparent"}`,
                      background: active ? "rgba(26,20,16,0.07)" : "#fff",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      fontFamily: FONT_BODY,
                      boxShadow: active
                        ? "none"
                        : "0 1px 4px rgba(26,20,16,0.06)",
                      transition: "all 0.15s",
                      minWidth: 80,
                    }}
                    aria-pressed={active}
                  >
                    <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>
                      {icon}
                    </span>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: active ? 700 : 600,
                        color: active ? C.navy : C.slate,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {label}
                    </span>
                    {active && (
                      <motion.div
                        layoutId="cat-indicator"
                        style={{
                          position: "absolute",
                          bottom: -1,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 24,
                          height: 2.5,
                          background: C.navy,
                          borderRadius: 999,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 35,
                        }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Right scroll */}
            <motion.button
              whileHover={{ scale: 1.08, background: "#fff" }}
              whileTap={{ scale: 0.93 }}
              onClick={() => scroll(1)}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "#fff",
                border: `1.5px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(26,20,16,0.07)",
              }}
              aria-label="Scroll right"
            >
              <svg
                width={14}
                height={14}
                viewBox="0 0 24 24"
                fill="none"
                stroke={C.slate}
                strokeWidth={2.5}
                strokeLinecap="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </motion.button>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

// ─── SECTION 3: Featured Listings ────────────────────────────────────────────
function FeaturedListingsSection({ activeCategory }) {
  const { data, isLoading } = useListings({
    category: activeCategory || undefined,
  });
  const listings = data?.listings ?? [];
  const displayed = listings.slice(0, 8);

  const catLabel = CATEGORIES.find((c) => c.key === activeCategory)?.label;

  return (
    <Reveal>
      <section
        style={{ maxWidth: 1280, margin: "0 auto", padding: "72px 32px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 44,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <SectionTitle
            eyebrow={
              activeCategory ? `${catLabel} stays` : "Hand-picked for you"
            }
            title={
              activeCategory ? (
                <>
                  The finest{" "}
                  <em style={{ fontStyle: "italic", color: C.coral }}>
                    {catLabel}
                  </em>{" "}
                  stays
                </>
              ) : (
                <>
                  Stays worth{" "}
                  <em style={{ fontStyle: "italic", color: C.coral }}>
                    remembering
                  </em>
                </>
              )
            }
          />
          <Link
            to="/listings"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.875rem",
              fontWeight: 700,
              color: C.navy,
              textDecoration: "none",
              borderBottom: `1.5px solid ${C.navy}`,
              paddingBottom: 2,
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "color 0.15s, border-color 0.15s",
            }}
          >
            View all listings
            <svg
              width={13}
              height={13}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(268px, 1fr))",
                gap: "28px 20px",
              }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <ListingCardSkeleton key={i} />
              ))}
            </motion.div>
          ) : displayed.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: "center", padding: "60px 0", color: C.slate }}
            >
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔍</div>
              <p
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: "1.4rem",
                  marginBottom: 16,
                  color: C.navy,
                }}
              >
                No listings found
              </p>
              <button
                onClick={() => {}}
                style={{
                  padding: "10px 24px",
                  border: `1.5px solid ${C.coral}`,
                  borderRadius: 999,
                  background: "transparent",
                  color: C.coral,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  fontFamily: FONT_BODY,
                }}
              >
                Clear filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={activeCategory || "all"}
              variants={stagger}
              initial="hidden"
              animate="visible"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(268px, 1fr))",
                gap: "36px 20px",
              }}
            >
              {displayed.map((listing, i) => (
                <ListingCard key={listing._id} listing={listing} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </Reveal>
  );
}

// ─── Ticker ───────────────────────────────────────────────────────────────────
function Ticker() {
  return (
    <div
      style={{
        background: C.navy,
        overflow: "hidden",
        padding: "14px 0",
        borderTop: `1px solid rgba(255,255,255,0.05)`,
      }}
    >
      <div
        style={{
          display: "flex",
          whiteSpace: "nowrap",
          animation: "hp-ticker 28s linear infinite",
          willChange: "transform",
        }}
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 16,
              padding: "0 36px",
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.82rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {item}
            <span
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: C.coral,
                display: "inline-block",
              }}
            />
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── SECTION 4: Trending Destinations ────────────────────────────────────────
function TrendingDestinationsSection() {
  return (
    <Reveal>
      <section
        style={{ maxWidth: 1280, margin: "0 auto", padding: "72px 32px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 44,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <SectionTitle
            eyebrow="Discover the world"
            title={
              <>
                Trending{" "}
                <em style={{ fontStyle: "italic", color: C.coral }}>
                  destinations
                </em>
              </>
            }
            subtitle="The places everyone is talking about right now."
          />
          <Link
            to="/listings"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.875rem",
              fontWeight: 700,
              color: C.navy,
              textDecoration: "none",
              borderBottom: `1.5px solid ${C.navy}`,
              paddingBottom: 2,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Explore all
            <svg
              width={13}
              height={13}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Mosaic grid: 2 large + 3 small */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gridTemplateRows: "280px 220px",
            gap: 12,
          }}
        >
          {/* Large — spans 2 rows */}
          <div style={{ gridColumn: "1", gridRow: "1 / 3" }}>
            <DestinationCard dest={DESTINATIONS[0]} index={0} isLarge />
          </div>
          <DestinationCard dest={DESTINATIONS[1]} index={1} isLarge={false} />
          <DestinationCard dest={DESTINATIONS[2]} index={2} isLarge={false} />
          <DestinationCard dest={DESTINATIONS[3]} index={3} isLarge={false} />
          <DestinationCard dest={DESTINATIONS[4]} index={4} isLarge={false} />
        </motion.div>
      </section>
    </Reveal>
  );
}

// ─── SECTION 5: Experiences ───────────────────────────────────────────────────
function ExperiencesSection() {
  return (
    <Reveal>
      <section
        style={{
          background: C.sand,
          padding: "72px 0",
          borderTop: `1px solid ${C.border}`,
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: 44,
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <SectionTitle
              eyebrow="Curated experiences"
              title={
                <>
                  More than a place to{" "}
                  <em style={{ fontStyle: "italic", color: C.coral }}>sleep</em>
                </>
              }
              subtitle="Local experiences that turn a trip into a memory."
            />
            <Link
              to="/listings"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.875rem",
                fontWeight: 700,
                color: C.navy,
                textDecoration: "none",
                borderBottom: `1.5px solid ${C.navy}`,
                paddingBottom: 2,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              Browse experiences
              <svg
                width={13}
                height={13}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 20,
            }}
          >
            {EXPERIENCES.map((exp, i) => (
              <ExperienceCard key={exp.title} exp={exp} index={i} />
            ))}
          </motion.div>
        </div>
      </section>
    </Reveal>
  );
}

// ─── SECTION 6: Become a Host CTA ─────────────────────────────────────────────
function HostCTASection() {
  return (
    <Reveal>
      <section
        style={{ maxWidth: 1280, margin: "0 auto", padding: "72px 32px" }}
      >
        <div
          style={{
            borderRadius: 28,
            overflow: "hidden",
            position: "relative",
            minHeight: 420,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            background: C.navy,
          }}
        >
          {/* Left: Content */}
          <div
            style={{
              padding: "60px 56px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 24,
              position: "relative",
              zIndex: 1,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: C.coral,
                  marginBottom: 14,
                }}
              >
                Earn with Wanderlust
              </p>
              <h2
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: "clamp(2rem, 3.5vw, 3rem)",
                  fontWeight: 300,
                  color: "#fff",
                  lineHeight: 1.12,
                  marginBottom: 16,
                }}
              >
                Your home could be{" "}
                <em style={{ fontStyle: "italic", color: C.coral }}>
                  someone's dream
                </em>
              </h2>
              <p
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: "1rem",
                  color: "rgba(255,255,255,0.6)",
                  lineHeight: 1.65,
                  fontWeight: 300,
                  maxWidth: 400,
                }}
              >
                Join 50,000+ hosts earning on their own terms. Set your own
                schedule, your own rules, and your own price — we handle the
                rest.
              </p>
            </div>

            {/* Benefits */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: "🔑", text: "Free to list, no subscription" },
                { icon: "🛡️", text: "$1M host protection guarantee" },
                { icon: "💬", text: "Dedicated host support 24/7" },
              ].map(({ icon, text }) => (
                <div
                  key={text}
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <span style={{ fontSize: "1.1rem" }}>{icon}</span>
                  <span
                    style={{
                      fontSize: "0.875rem",
                      color: "rgba(255,255,255,0.75)",
                      fontWeight: 500,
                    }}
                  >
                    {text}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  to="/listings/new"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "14px 28px",
                    background: C.coral,
                    borderRadius: 999,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.9375rem",
                    textDecoration: "none",
                    boxShadow: "0 8px 28px rgba(255,90,95,0.35)",
                    fontFamily: FONT_BODY,
                  }}
                >
                  Start hosting
                  <svg
                    width={15}
                    height={15}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <button
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "14px 28px",
                    background: "transparent",
                    border: "1.5px solid rgba(255,255,255,0.25)",
                    borderRadius: 999,
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: 600,
                    fontSize: "0.9375rem",
                    cursor: "pointer",
                    fontFamily: FONT_BODY,
                    transition: "border-color 0.15s",
                  }}
                >
                  Learn how it works
                </button>
              </motion.div>
            </div>

            <p
              style={{
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.35)",
                marginTop: -8,
              }}
            >
              Free to list · No commission until you earn
            </p>
          </div>

          {/* Right: Image */}
          <div style={{ position: "relative", overflow: "hidden" }}>
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80"
              alt="Beautiful home for hosting"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to right, rgba(26,20,16,0.5) 0%, transparent 60%)",
              }}
            />

            {/* Floating earning card */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 3.5,
                ease: "easeInOut",
                repeat: Infinity,
              }}
              style={{
                position: "absolute",
                bottom: 32,
                left: 32,
                background: "rgba(255,255,255,0.97)",
                backdropFilter: "blur(16px)",
                borderRadius: 18,
                padding: "16px 20px",
                boxShadow: "0 12px 40px rgba(26,20,16,0.2)",
                minWidth: 200,
              }}
            >
              <p
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: C.slate,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Average earnings
              </p>
              <p
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: "2rem",
                  color: C.navy,
                  fontWeight: 400,
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                ₹45,000
              </p>
              <p style={{ fontSize: "0.75rem", color: C.slate }}>
                per month for 3-bed homes
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginTop: 8,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: C.green,
                  }}
                />
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: C.green,
                    fontWeight: 700,
                  }}
                >
                  +18% vs last year
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

// ─── SECTION 7: Testimonials ──────────────────────────────────────────────────
function TestimonialsSection() {
  return (
    <Reveal>
      <section
        style={{
          background: C.sand,
          padding: "72px 0",
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ marginBottom: 48 }}>
            <SectionTitle
              eyebrow="What travellers say"
              title={
                <>
                  Stories from{" "}
                  <em style={{ fontStyle: "italic", color: C.coral }}>
                    real guests
                  </em>
                </>
              }
              subtitle="Not every stay is memorable. These ones were."
              center
            />
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={t.name} t={t} index={i} />
            ))}
          </motion.div>

          {/* Trust line */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 32,
              marginTop: 48,
              paddingTop: 40,
              borderTop: `1px solid ${C.border}`,
              flexWrap: "wrap",
            }}
          >
            {[
              { icon: "🛡️", label: "Verified reviews only" },
              { icon: "⭐", label: "4.95 average rating" },
              { icon: "💬", label: "Over 2M guest reviews" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <span style={{ fontSize: "1.2rem" }}>{icon}</span>
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: C.navy,
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}

// ─── SECTION 8: Mini Footer CTA ───────────────────────────────────────────────
function MiniFooterCTA() {
  return (
    <Reveal>
      <section
        style={{
          background: C.navy,
          padding: "64px 32px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <p
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
              fontWeight: 300,
              color: "#fff",
              lineHeight: 1.2,
              marginBottom: 18,
            }}
          >
            Ready to find your{" "}
            <em style={{ fontStyle: "italic", color: C.coral }}>
              perfect stay?
            </em>
          </p>
          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize: "0.95rem",
              color: "rgba(255,255,255,0.55)",
              fontWeight: 300,
              lineHeight: 1.65,
              marginBottom: 32,
            }}
          >
            Join over 2 million travellers who discovered something
            extraordinary.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <motion.div
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                to="/listings"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "15px 32px",
                  background: C.coral,
                  borderRadius: 999,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  textDecoration: "none",
                  boxShadow: "0 8px 28px rgba(255,90,95,0.4)",
                  fontFamily: FONT_BODY,
                }}
              >
                Explore stays
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/listings/new"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "15px 28px",
                  background: "transparent",
                  border: "1.5px solid rgba(255,255,255,0.25)",
                  borderRadius: 999,
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  textDecoration: "none",
                  fontFamily: FONT_BODY,
                }}
              >
                Become a host
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

// ─── Responsive CSS ───────────────────────────────────────────────────────────
const RESPONSIVE_CSS = `
  @media (max-width: 1024px) {
    .hp-dest-grid { grid-template-columns: 1fr 1fr !important; grid-template-rows: auto !important; }
    .hp-dest-grid > *:first-child { grid-column: 1; grid-row: 1; }
  }
  @media (max-width: 768px) {
    .hp-hero-stats { display: none !important; }
    .hp-host-grid { grid-template-columns: 1fr !important; }
    .hp-host-grid > *:last-child { display: none; }
    .hp-dest-grid { grid-template-columns: 1fr !important; grid-template-rows: auto !important; }
    .hp-search-bar { flex-direction: column !important; border-radius: 20px !important; }
    .hp-search-field { border-right: none !important; border-bottom: 1px solid #E8E3DC; }
    .hp-search-field:last-of-type { border-bottom: none; }
  }
`;

// ─── Root component ───────────────────────────────────────────────────────────
export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState(null);

  // Inject styles once
  useEffect(() => {
    const id = "wl-hp-styles";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id;
      el.textContent = GLOBAL_CSS + RESPONSIVE_CSS;
      document.head.appendChild(el);
    }
  }, []);

  // Prefetch listings for hero visual
  const { data: allData } = useListings({});
  const listings = allData?.listings ?? [];

  return (
    <div className="hp-root">
      {/* ── 1. Hero ── */}
      <HeroSection listings={listings} />

      {/* ── Ticker ── */}
      <Ticker />

      {/* ── 2. Categories ── */}
      <CategoriesSection
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {/* ── 3. Featured Listings ── */}
      <FeaturedListingsSection activeCategory={activeCategory} />

      {/* ── 4. Trending Destinations ── */}
      <TrendingDestinationsSection />

      {/* ── 5. Experiences ── */}
      <ExperiencesSection />

      {/* ── 6. Host CTA ── */}
      <HostCTASection />

      {/* ── 7. Testimonials ── */}
      <TestimonialsSection />

      {/* ── 8. Mini Footer CTA ── */}
      <MiniFooterCTA />
    </div>
  );
}
