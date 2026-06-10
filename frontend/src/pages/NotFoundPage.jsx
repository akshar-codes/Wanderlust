/* ─── NotFoundPage.jsx ─────────────────────────────────────── */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, ArrowLeft } from "lucide-react";

export function NotFoundPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "55vh",
        gap: 24,
        textAlign: "center",
        padding: "60px 24px",
      }}
    >
      {/* Animated compass */}
      <motion.div
        animate={{ rotate: [0, 15, -15, 10, -10, 0] }}
        transition={{ duration: 1.2, delay: 0.3 }}
        style={{
          width: 88,
          height: 88,
          borderRadius: 24,
          background: "linear-gradient(135deg, #fff1ef, #ffe1dc)",
          border: "1.5px solid #ffc1b8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Compass size={40} color="#ff9a8d" strokeWidth={1.4} />
      </motion.div>

      {/* 404 */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: "clamp(4rem, 10vw, 6.5rem)",
          lineHeight: 1,
          color: "#261f1a",
          letterSpacing: "-0.02em",
        }}
      >
        404
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <p
          style={{
            fontSize: "1.1rem",
            color: "#5c544c",
            fontWeight: 500,
            marginBottom: 8,
          }}
        >
          Oops — this destination doesn't exist.
        </p>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#8a8179",
            maxWidth: 360,
            lineHeight: 1.6,
          }}
        >
          The page you're looking for may have moved, been deleted, or never
          existed. Let's get you back on track.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <motion.div
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link
            to="/listings"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              background: "linear-gradient(135deg, #ff5a5f, #e84040)",
              borderRadius: 999,
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.9375rem",
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(255,90,95,0.3)",
            }}
          >
            Explore listings
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <button
            onClick={() => window.history.back()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              background: "#fff",
              border: "1.5px solid #d6d0ca",
              borderRadius: 999,
              fontWeight: 600,
              fontSize: "0.9375rem",
              color: "#3d3630",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <ArrowLeft size={15} /> Go back
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default NotFoundPage;
