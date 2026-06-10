import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  RefreshCw,
  Inbox,
  Wifi,
  Lock,
  Search,
  MapPin,
} from "lucide-react";
import { Skeleton as MuiSkeleton } from "@mui/material";

/* ═══════════════════════════════════════════════════════════════
   PAGE LOADING SPINNER
═══════════════════════════════════════════════════════════════ */
export function PageLoader({ message = "Loading…" }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "40vh",
        gap: 20,
      }}
    >
      <div style={{ position: "relative", width: 52, height: 52 }}>
        {/* Outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2.5px solid transparent",
            borderTopColor: "#ff5a5f",
            borderRightColor: "rgba(255,90,95,0.3)",
          }}
        />
        {/* Inner ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            inset: 8,
            borderRadius: "50%",
            border: "2px solid transparent",
            borderBottomColor: "#ff5a5f",
            borderLeftColor: "rgba(255,90,95,0.2)",
          }}
        />
        {/* Center dot */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#ff5a5f",
            }}
          />
        </motion.div>
      </div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ fontSize: "0.875rem", color: "#8a8179", fontWeight: 500 }}
      >
        {message}
      </motion.p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INLINE SPINNER
═══════════════════════════════════════════════════════════════ */
export function Spinner({ size = 20, color = "#ff5a5f" }) {
  return (
    <motion.svg
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Loading"
      role="status"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="31.416"
        strokeDashoffset="10"
      />
    </motion.svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SKELETON LOADERS
═══════════════════════════════════════════════════════════════ */
export function ListingCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      <MuiSkeleton
        variant="rectangular"
        animation="wave"
        sx={{ borderRadius: "20px", aspectRatio: "4/3", height: "auto" }}
      />
      <div
        style={{
          padding: "0 2px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <MuiSkeleton
          variant="text"
          animation="wave"
          width="40%"
          height={13}
          sx={{ borderRadius: 6 }}
        />
        <MuiSkeleton
          variant="text"
          animation="wave"
          width="75%"
          height={18}
          sx={{ borderRadius: 6 }}
        />
        <MuiSkeleton
          variant="text"
          animation="wave"
          width="55%"
          height={14}
          sx={{ borderRadius: 6 }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 4,
          }}
        >
          <MuiSkeleton
            variant="text"
            animation="wave"
            width="35%"
            height={16}
            sx={{ borderRadius: 6 }}
          />
          <MuiSkeleton
            variant="text"
            animation="wave"
            width="20%"
            height={16}
            sx={{ borderRadius: 6 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function ListingsGridSkeleton({ count = 6 }) {
  return (
    <div
      style={{
        display: "grid",
        gap: "24px 20px",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.35 }}
        >
          <ListingCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
}

export function ShowPageSkeleton() {
  return (
    <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 24px" }}>
      <MuiSkeleton
        variant="text"
        width="60%"
        height={48}
        sx={{ mb: 1, borderRadius: 8 }}
        animation="wave"
      />
      <MuiSkeleton
        variant="text"
        width="35%"
        height={24}
        sx={{ mb: 3, borderRadius: 8 }}
        animation="wave"
      />
      <MuiSkeleton
        variant="rectangular"
        height={460}
        sx={{ borderRadius: "20px", mb: 4 }}
        animation="wave"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: "32px 40px",
        }}
      >
        <div>
          {[80, 90, 70, 95, 75].map((w, i) => (
            <MuiSkeleton
              key={i}
              variant="text"
              width={`${w}%`}
              height={22}
              sx={{ mb: 1.5, borderRadius: 6 }}
              animation="wave"
            />
          ))}
        </div>
        <MuiSkeleton
          variant="rectangular"
          height={400}
          sx={{ borderRadius: "20px" }}
          animation="wave"
        />
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div style={{ maxWidth: 560, margin: "40px auto", padding: "0 20px" }}>
      <div
        style={{
          background: "#fff",
          border: "1px solid #ebe7e3",
          borderRadius: 24,
          padding: "40px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <MuiSkeleton
          variant="text"
          width="50%"
          height={36}
          sx={{ borderRadius: 8 }}
          animation="wave"
        />
        <MuiSkeleton
          variant="text"
          width="70%"
          height={20}
          sx={{ borderRadius: 6 }}
          animation="wave"
        />
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            style={{ display: "flex", flexDirection: "column", gap: 6 }}
          >
            <MuiSkeleton
              variant="text"
              width="30%"
              height={14}
              sx={{ borderRadius: 4 }}
              animation="wave"
            />
            <MuiSkeleton
              variant="rectangular"
              height={48}
              sx={{ borderRadius: 10 }}
              animation="wave"
            />
          </div>
        ))}
        <MuiSkeleton
          variant="rectangular"
          height={52}
          sx={{ borderRadius: 999 }}
          animation="wave"
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATES
═══════════════════════════════════════════════════════════════ */
const emptyConfigs = {
  search: {
    icon: <Search size={40} strokeWidth={1.2} />,
    title: "No results found",
    body: "Try adjusting your filters or searching for something else.",
  },
  listings: {
    icon: <MapPin size={40} strokeWidth={1.2} />,
    title: "No listings yet",
    body: "Be the first to list your space and start hosting travellers.",
  },
  reviews: {
    icon: <Inbox size={40} strokeWidth={1.2} />,
    title: "No reviews yet",
    body: "Be the first to share your experience at this property.",
  },
  generic: {
    icon: <Inbox size={40} strokeWidth={1.2} />,
    title: "Nothing here yet",
    body: "There's no content to display right now.",
  },
};

export function EmptyState({ variant = "generic", title, body, action }) {
  const config = emptyConfigs[variant] ?? emptyConfigs.generic;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "28vh",
        gap: 16,
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      {/* Animated icon container */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 80,
          height: 80,
          borderRadius: 24,
          background: "linear-gradient(135deg, #fff8f7 0%, #fff1ef 100%)",
          border: "1.5px solid #ffe1dc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ff9a8d",
        }}
      >
        {config.icon}
      </motion.div>

      <div>
        <h3
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "1.5rem",
            color: "#261f1a",
            marginBottom: 8,
          }}
        >
          {title ?? config.title}
        </h3>
        <p
          style={{
            fontSize: "0.9375rem",
            color: "#8a8179",
            maxWidth: 340,
            lineHeight: 1.6,
          }}
        >
          {body ?? config.body}
        </p>
      </div>

      {action && (
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ERROR STATES
═══════════════════════════════════════════════════════════════ */
const errorConfigs = {
  network: {
    icon: <Wifi size={36} strokeWidth={1.2} />,
    title: "Connection lost",
    body: "Check your internet connection and try again.",
  },
  auth: {
    icon: <Lock size={36} strokeWidth={1.2} />,
    title: "Access denied",
    body: "You need to be signed in to view this content.",
  },
  notfound: {
    icon: <Search size={36} strokeWidth={1.2} />,
    title: "Not found",
    body: "The page or resource you're looking for doesn't exist.",
  },
  generic: {
    icon: <AlertTriangle size={36} strokeWidth={1.2} />,
    title: "Something went wrong",
    body: "An unexpected error occurred. Please try again.",
  },
};

export function ErrorState({ variant = "generic", message, onRetry }) {
  const config = errorConfigs[variant] ?? errorConfigs.generic;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "28vh",
        gap: 16,
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
          border: "1.5px solid #fca5a5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ef4444",
        }}
      >
        {config.icon}
      </motion.div>

      <div>
        <h3
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "1.4rem",
            color: "#261f1a",
            marginBottom: 8,
          }}
        >
          {config.title}
        </h3>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#8a8179",
            maxWidth: 340,
            lineHeight: 1.6,
            marginBottom: message ? 8 : 0,
          }}
        >
          {config.body}
        </p>
        {message && (
          <p
            style={{
              fontSize: "0.8rem",
              color: "#ef4444",
              background: "#fef2f2",
              padding: "8px 16px",
              borderRadius: 10,
              border: "1px solid #fee2e2",
              fontFamily: "monospace",
              marginTop: 8,
            }}
          >
            {message}
          </p>
        )}
      </div>

      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={onRetry}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 22px",
            background: "#fff",
            border: "1.5px solid #d6d0ca",
            borderRadius: 999,
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#3d3630",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <RefreshCw size={15} />
          Try again
        </motion.button>
      )}
    </motion.div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        margin: "24px auto",
        maxWidth: 640,
        background: "#fef2f2",
        border: "1px solid #fca5a5",
        borderRadius: 16,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
      <p
        style={{
          flex: 1,
          fontSize: "0.9rem",
          color: "#b91c1c",
          fontWeight: 500,
        }}
      >
        {message}
      </p>
      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            background: "#fff",
            border: "1.5px solid #fca5a5",
            borderRadius: 999,
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "#b91c1c",
            cursor: "pointer",
            fontFamily: "inherit",
            flexShrink: 0,
          }}
        >
          <RefreshCw size={13} /> Retry
        </motion.button>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCROLL ANIMATION WRAPPER
═══════════════════════════════════════════════════════════════ */
export function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  distance = 24,
  className,
  style,
}) {
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? distance : direction === "down" ? -distance : 0,
      x:
        direction === "left" ? distance : direction === "right" ? -distance : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: 0.55,
        delay,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STAGGER CONTAINER
═══════════════════════════════════════════════════════════════ */
export function StaggerContainer({
  children,
  staggerDelay = 0.08,
  style,
  className,
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, direction = "up", style }) {
  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: direction === "up" ? 20 : -20,
          x: direction === "left" ? 20 : direction === "right" ? -20 : 0,
        },
        visible: {
          opacity: 1,
          y: 0,
          x: 0,
          transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FADE TRANSITION WRAPPER (for page transitions)
═══════════════════════════════════════════════════════════════ */
export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default {
  PageLoader,
  Spinner,
  ListingCardSkeleton,
  ListingsGridSkeleton,
  ShowPageSkeleton,
  FormSkeleton,
  EmptyState,
  ErrorState,
  ErrorBanner,
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  PageTransition,
};
