import { useState } from "react";
import { Link } from "react-router-dom";
import { brand, neutral, semantic } from "../../theme/tokens";
import { motion } from "framer-motion";
import { useCurrency } from "../../hooks/useCurrency";
import { formatPrice } from "../../utils/currency";
import {
  Compass,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  ArrowRight,
  Globe,
  Shield,
  Heart,
} from "lucide-react";

const footerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const columns = [
  {
    heading: "Explore",
    links: [
      { label: "All listings", to: "/listings" },
      { label: "Trending stays", to: "/listings?category=trending" },
      { label: "Mountain retreats", to: "/listings?category=mountains" },
      { label: "Iconic cities", to: "/listings?category=iconic" },
      { label: "Arctic escapes", to: "/listings?category=arctic" },
      { label: "Castle stays", to: "/listings?category=castles" },
    ],
  },
  {
    heading: "Hosting",
    links: [
      { label: "List your space", to: "/listings/new" },
      { label: "Host resources", to: "#" },
      { label: "Community forum", to: "#" },
      { label: "Host guarantee", to: "#" },
      { label: "Responsible hosting", to: "#" },
      { label: "Superhost programme", to: "#" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help centre", to: "#" },
      { label: "Safety information", to: "#" },
      { label: "Cancellation options", to: "#" },
      { label: "Report a concern", to: "#" },
      { label: "Accessibility", to: "#" },
      { label: "Contact us", to: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Wanderlust", to: "#" },
      { label: "Newsroom", to: "#" },
      { label: "Careers", to: "#" },
      { label: "Investors", to: "#" },
      { label: "Gift cards", to: "#" },
      { label: "Brand assets", to: "#" },
    ],
  },
];

const socials = [
  {
    icon: <Instagram size={17} />,
    label: "Instagram",
    href: "https://instagram.com",
  },
  {
    icon: <Twitter size={17} />,
    label: "X (Twitter)",
    href: "https://twitter.com",
  },
  {
    icon: <Facebook size={17} />,
    label: "Facebook",
    href: "https://facebook.com",
  },
  {
    icon: <Linkedin size={17} />,
    label: "LinkedIn",
    href: "https://linkedin.com",
  },
  {
    icon: <Youtube size={17} />,
    label: "YouTube",
    href: "https://youtube.com",
  },
];

const badges = [
  { icon: <Shield size={13} />, label: "Secure payments" },
  { icon: <Globe size={13} />, label: "180+ countries" },
  { icon: <Heart size={13} />, label: "10K+ verified hosts" },
];

export default function Footer() {
  const { currency } = useCurrency();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer
      style={{
        background: neutral[50],
        borderTop: "1px solid #ebe7e3",
        marginTop: "auto",
      }}
    >
      {/* Top band — newsletter */}
      <div
        style={{
          background: `linear-gradient(135deg, ${neutral[800]}, ${neutral[700]})`,
          padding: "48px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 32,
          }}
        >
          <div style={{ maxWidth: 420 }}>
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: brand[200],
                marginBottom: 10,
              }}
            >
              Stay inspired
            </p>
            <h3
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                color: neutral[0],
                marginBottom: 10,
                lineHeight: 1.2,
              }}
            >
              Discover places you'll love
            </h3>
            <p
              style={{
                fontSize: "0.875rem",
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.7,
              }}
            >
              Get handpicked listings, travel inspo, and exclusive deals
              delivered to your inbox.
            </p>
          </div>

          <form
            onSubmit={handleSubscribe}
            style={{
              display: "flex",
              gap: 0,
              maxWidth: 400,
              width: "100%",
              minWidth: 280,
            }}
          >
            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 20px",
                  background: "rgba(16,185,129,0.15)",
                  border: "1.5px solid rgba(16,185,129,0.3)",
                  borderRadius: 14,
                  color: semantic.success.muted,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                ✓ You're on the list!
              </motion.div>
            ) : (
              <>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  style={{
                    flex: 1,
                    padding: "13px 18px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1.5px solid rgba(255,255,255,0.15)",
                    borderRight: "none",
                    borderRadius: "12px 0 0 12px",
                    color: neutral[0],
                    fontSize: "0.875rem",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
                <motion.button
                  whileHover={{ background: brand[600] }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "13px 20px",
                    background: brand[500],
                    border: "1.5px solid #ff5a5f",
                    borderRadius: "0 12px 12px 0",
                    color: neutral[0],
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                  }}
                >
                  Subscribe <ArrowRight size={14} />
                </motion.button>
              </>
            )}
          </form>
        </div>
      </div>

      {/* Main footer columns */}
      <div
        style={{ padding: "56px 24px 40px", maxWidth: 1280, margin: "0 auto" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "40px 32px",
          }}
        >
          {/* Brand column */}
          <div style={{ gridColumn: "span 1" }}>
            <Link
              to="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
                marginBottom: 16,
              }}
            >
              <Compass size={24} color={brand[500]} />
              <span
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: "1.2rem",
                  color: neutral[800],
                }}
              >
                Wanderlust
              </span>
            </Link>
            <p
              style={{
                fontSize: "0.8125rem",
                color: neutral[500],
                lineHeight: 1.7,
                marginBottom: 20,
              }}
            >
              Discover extraordinary places and unique stays around the world.
            </p>

            {/* Trust badges */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {badges.map((b) => (
                <div
                  key={b.label}
                  style={{ display: "flex", alignItems: "center", gap: 7 }}
                >
                  <span style={{ color: brand[500] }}>{b.icon}</span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: neutral[600],
                      fontWeight: 500,
                    }}
                  >
                    {b.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Socials */}
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              {socials.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  whileHover={{ scale: 1.12, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: neutral[100],
                    border: "1px solid #ebe7e3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: neutral[600],
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = brand[500];
                    e.currentTarget.style.color = neutral[0];
                    e.currentTarget.style.borderColor = brand[500];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = neutral[100];
                    e.currentTarget.style.color = neutral[600];
                    e.currentTarget.style.borderColor = neutral[200];
                  }}
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.heading}>
              <h4
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: neutral[800],
                  marginBottom: 16,
                }}
              >
                {col.heading}
              </h4>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      style={{
                        fontSize: "0.875rem",
                        color: neutral[500],
                        textDecoration: "none",
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = brand[500];
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = neutral[500];
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* App store badges */}
        <div
          style={{
            marginTop: 40,
            paddingTop: 32,
            borderTop: "1px solid #ebe7e3",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            {["App Store", "Google Play"].map((store) => (
              <motion.a
                key={store}
                href="#"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 16px",
                  background: neutral[800],
                  borderRadius: 10,
                  textDecoration: "none",
                }}
              >
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "rgba(255,255,255,0.6)",
                    display: "block",
                    lineHeight: 1,
                  }}
                >
                  {store === "App Store" ? "Download on the" : "Get it on"}
                </span>
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: neutral[0],
                    fontWeight: 600,
                    lineHeight: 1,
                  }}
                >
                  {store}
                </span>
              </motion.a>
            ))}
          </div>

          {/* Language / currency */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 12px",
                background: "none",
                border: "1px solid #d6d0ca",
                borderRadius: 8,
                fontSize: "0.8125rem",
                color: neutral[600],
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 500,
              }}
            >
              <Globe size={13} /> English
            </button>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 12px",
                background: "none",
                border: "1px solid #d6d0ca",
                borderRadius: 8,
                fontSize: "0.8125rem",
                color: neutral[600],
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 500,
              }}
            >
              {currency}
            </button>
          </div>
        </div>

        {/* Legal bottom bar */}
        <div
          style={{
            marginTop: 24,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <p style={{ fontSize: "0.8rem", color: neutral[400] }}>
            © {new Date().getFullYear()} WanderLust Private Limited · All rights
            reserved.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {[
              { label: "Privacy Policy", to: "/privacy" },
              { label: "Terms of Service", to: "/terms" },
              { label: "Cookie Settings", to: "#" },
              { label: "Sitemap", to: "#" },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.to}
                style={{
                  fontSize: "0.8rem",
                  color: neutral[400],
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = neutral[600])}
                onMouseLeave={(e) => (e.currentTarget.style.color = neutral[400])}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
