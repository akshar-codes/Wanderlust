/**
 * Wanderlust — Redesigned Homepage
 *
 * Drop-in replacement for the existing wanderlust-react frontend.
 * Compatible with the existing Express backend API at /api.
 *
 * How to integrate:
 *  1. Copy this file to wanderlust-react/src/pages/HomePage.jsx
 *  2. In App.jsx, add a route for "/" → <HomePage />
 *     (before the redirect to /listings)
 *  3. npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
 *  4. The component self-imports everything it needs from MUI + existing hooks.
 *
 * All API calls use the existing hooks (useListings) and services — fully compatible.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useListings } from "../hooks/useListings";

// ─── Inline CSS-variables theme (no build step needed) ───────────────────────
const THEME = {
  coral: "#FF5A5F",
  coralDark: "#E04E53",
  coralLight: "#FFF0F0",
  teal: "#00A699",
  navy: "#0D1B2A",
  sand: "#F7F4EF",
  warmWhite: "#FDFCFB",
  slate: "#6B7280",
  border: "#E5E0D8",
  gold: "#F59E0B",
};

// ─── Tiny keyframe injection ──────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --coral: #FF5A5F;
    --coral-dark: #E04E53;
    --teal: #00A699;
    --navy: #0D1B2A;
    --sand: #F7F4EF;
    --warm-white: #FDFCFB;
    --slate: #6B7280;
    --border: #E5E0D8;
    --gold: #F59E0B;
    --font-display: 'Cormorant Garamond', Georgia, serif;
    --font-body: 'Outfit', system-ui, sans-serif;
    --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
    --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-12px); }
  }
  @keyframes shimmer {
    0%   { background-position: -800px 0; }
    100% { background-position: 800px 0; }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(2); opacity: 0; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes slideRight {
    from { transform: translateX(-20px); opacity: 0; }
    to   { transform: translateX(0); opacity: 1; }
  }
  @keyframes ticker {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  .wl-page {
    font-family: var(--font-body);
    background: var(--warm-white);
    color: var(--navy);
    overflow-x: hidden;
  }

  /* ─── Skeleton loader ────────────────── */
  .skeleton {
    background: linear-gradient(90deg, #f0ece4 25%, #e8e3db 50%, #f0ece4 75%);
    background-size: 800px 100%;
    animation: shimmer 1.6s infinite;
    border-radius: 12px;
  }

  /* ─── Hero ───────────────────────────── */
  .hero {
    position: relative;
    min-height: 92vh;
    display: flex;
    align-items: center;
    overflow: hidden;
    background: var(--navy);
  }
  .hero-bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 70% 40%, rgba(0,166,153,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 60% 80% at 20% 80%, rgba(255,90,95,0.22) 0%, transparent 55%),
      linear-gradient(135deg, #0D1B2A 0%, #1a3a4a 100%);
  }
  .hero-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
  }
  .hero-content {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    padding: 120px 48px 80px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
  }
  .hero-text { animation: fadeUp 0.9s var(--ease-smooth) both; }
  .hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,90,95,0.15);
    border: 1px solid rgba(255,90,95,0.3);
    color: #FF8A8E;
    padding: 6px 14px;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 28px;
  }
  .hero-eyebrow-dot {
    width: 6px; height: 6px;
    background: var(--coral);
    border-radius: 50%;
    position: relative;
  }
  .hero-eyebrow-dot::after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    border: 1.5px solid var(--coral);
    animation: pulse-ring 1.5s ease infinite;
  }
  .hero-title {
    font-family: var(--font-display);
    font-size: clamp(3.2rem, 5.5vw, 5.5rem);
    font-weight: 300;
    line-height: 1.08;
    color: #fff;
    letter-spacing: -0.01em;
    margin-bottom: 24px;
  }
  .hero-title em {
    font-style: italic;
    color: var(--coral);
  }
  .hero-subtitle {
    font-size: 1.05rem;
    color: rgba(255,255,255,0.6);
    line-height: 1.75;
    max-width: 420px;
    margin-bottom: 44px;
    font-weight: 300;
  }
  .hero-cta-row {
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
  }
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--coral);
    color: #fff;
    padding: 14px 28px;
    border-radius: 100px;
    font-weight: 600;
    font-size: 0.9rem;
    text-decoration: none;
    transition: all 0.2s var(--ease-smooth);
    border: none;
    cursor: pointer;
    font-family: var(--font-body);
  }
  .btn-primary:hover {
    background: var(--coral-dark);
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(255,90,95,0.35);
  }
  .btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    color: rgba(255,255,255,0.8);
    padding: 14px 24px;
    border-radius: 100px;
    font-weight: 500;
    font-size: 0.9rem;
    text-decoration: none;
    border: 1.5px solid rgba(255,255,255,0.2);
    transition: all 0.2s var(--ease-smooth);
    cursor: pointer;
    font-family: var(--font-body);
  }
  .btn-ghost:hover {
    border-color: rgba(255,255,255,0.5);
    background: rgba(255,255,255,0.07);
  }
  .hero-stats {
    display: flex;
    gap: 40px;
    margin-top: 56px;
    padding-top: 40px;
    border-top: 1px solid rgba(255,255,255,0.1);
  }
  .hero-stat-num {
    font-family: var(--font-display);
    font-size: 2rem;
    color: #fff;
    font-weight: 600;
    line-height: 1;
  }
  .hero-stat-label {
    font-size: 0.78rem;
    color: rgba(255,255,255,0.45);
    margin-top: 4px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  /* Hero visual card cluster */
  .hero-visual {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 16px;
    animation: scaleIn 1s 0.3s var(--ease-smooth) both;
  }
  .hero-card {
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    transition: transform 0.35s var(--ease-spring);
  }
  .hero-card:hover { transform: scale(1.03) translateY(-4px); }
  .hero-card--large {
    grid-row: span 2;
    min-height: 380px;
  }
  .hero-card--sm { min-height: 180px; }
  .hero-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .hero-card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%);
  }
  .hero-card-label {
    position: absolute;
    bottom: 14px;
    left: 14px;
    right: 14px;
    color: #fff;
    font-size: 0.82rem;
    font-weight: 600;
  }
  .hero-card-price {
    display: inline-block;
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(8px);
    padding: 3px 10px;
    border-radius: 100px;
    font-size: 0.75rem;
    margin-top: 4px;
  }

  /* ─── Search bar (floating) ──────────────── */
  .search-bar-wrap {
    position: relative;
    z-index: 10;
    max-width: 1000px;
    margin: -36px auto 0;
    padding: 0 24px;
    animation: fadeUp 0.8s 0.5s both;
  }
  .search-bar {
    background: #fff;
    border-radius: 24px;
    box-shadow: 0 24px 80px rgba(13,27,42,0.18), 0 2px 12px rgba(13,27,42,0.08);
    display: flex;
    align-items: stretch;
    overflow: hidden;
    border: 1px solid var(--border);
  }
  .search-field {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 16px 24px;
    border-right: 1px solid var(--border);
    cursor: pointer;
    transition: background 0.15s;
  }
  .search-field:last-of-type { border-right: none; }
  .search-field:hover { background: #fafaf8; }
  .search-field label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--navy);
    margin-bottom: 4px;
  }
  .search-field input,
  .search-field select {
    border: none;
    outline: none;
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--slate);
    background: transparent;
    width: 100%;
  }
  .search-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--coral);
    color: #fff;
    border: none;
    padding: 0 28px;
    font-family: var(--font-body);
    font-weight: 700;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background 0.2s;
    flex-shrink: 0;
    border-radius: 0 24px 24px 0;
  }
  .search-btn:hover { background: var(--coral-dark); }

  /* ─── Section scaffolding ────────────────── */
  .section {
    max-width: 1280px;
    margin: 0 auto;
    padding: 80px 48px;
  }
  .section-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 48px;
    gap: 20px;
  }
  .section-eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--coral);
    margin-bottom: 10px;
  }
  .section-title {
    font-family: var(--font-display);
    font-size: clamp(2rem, 3.5vw, 3rem);
    font-weight: 400;
    line-height: 1.15;
    color: var(--navy);
  }
  .section-title em {
    font-style: italic;
    color: var(--coral);
  }
  .view-all {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--navy);
    text-decoration: none;
    border-bottom: 1.5px solid var(--navy);
    padding-bottom: 2px;
    white-space: nowrap;
    transition: color 0.15s, border-color 0.15s;
    flex-shrink: 0;
  }
  .view-all:hover { color: var(--coral); border-color: var(--coral); }

  /* ─── Destination cards ──────────────────── */
  .destinations-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  .dest-card {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    aspect-ratio: 3/4;
    cursor: pointer;
    transition: transform 0.35s var(--ease-spring), box-shadow 0.35s;
    text-decoration: none;
  }
  .dest-card:hover {
    transform: translateY(-8px) scale(1.01);
    box-shadow: 0 24px 60px rgba(13,27,42,0.18);
  }
  .dest-card img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.5s var(--ease-smooth);
  }
  .dest-card:hover img { transform: scale(1.06); }
  .dest-card-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(13,27,42,0.8) 0%, rgba(13,27,42,0.2) 50%, transparent 100%);
  }
  .dest-card-info {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 24px 20px;
    color: #fff;
  }
  .dest-card-city {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 400;
    line-height: 1.1;
    margin-bottom: 4px;
  }
  .dest-card-count {
    font-size: 0.78rem;
    color: rgba(255,255,255,0.7);
    font-weight: 400;
  }
  .dest-card-tag {
    position: absolute;
    top: 16px; right: 16px;
    background: rgba(255,255,255,0.18);
    backdrop-filter: blur(10px);
    color: #fff;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 100px;
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }

  /* ─── Category pills ─────────────────────── */
  .cats-section {
    background: var(--sand);
    padding: 64px 0;
  }
  .cats-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 48px;
  }
  .cats-scroll {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding-bottom: 8px;
    scrollbar-width: none;
    margin-top: 36px;
  }
  .cats-scroll::-webkit-scrollbar { display: none; }
  .cat-pill {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 20px 24px;
    background: #fff;
    border: 1.5px solid var(--border);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s var(--ease-smooth);
    text-decoration: none;
    color: var(--navy);
    white-space: nowrap;
    flex-shrink: 0;
    min-width: 100px;
  }
  .cat-pill:hover, .cat-pill--active {
    border-color: var(--coral);
    background: var(--coral);
    color: #fff;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(255,90,95,0.25);
  }
  .cat-pill-icon { font-size: 1.6rem; line-height: 1; }
  .cat-pill-label { font-size: 0.78rem; font-weight: 600; letter-spacing: 0.02em; }

  /* ─── Listings grid ──────────────────────── */
  .listings-section { background: var(--warm-white); }
  .listings-grid-home {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
  }
  .listing-card-home {
    border-radius: 20px;
    overflow: hidden;
    background: #fff;
    border: 1px solid var(--border);
    transition: transform 0.3s var(--ease-spring), box-shadow 0.3s;
    cursor: pointer;
    text-decoration: none;
    color: var(--navy);
    display: flex;
    flex-direction: column;
    animation: fadeUp 0.6s var(--ease-smooth) both;
  }
  .listing-card-home:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 60px rgba(13,27,42,0.12);
  }
  .listing-card-home:nth-child(1) { animation-delay: 0s; }
  .listing-card-home:nth-child(2) { animation-delay: 0.08s; }
  .listing-card-home:nth-child(3) { animation-delay: 0.16s; }
  .listing-card-home:nth-child(4) { animation-delay: 0.24s; }
  .listing-card-home:nth-child(5) { animation-delay: 0.32s; }
  .listing-card-home:nth-child(6) { animation-delay: 0.40s; }
  .listing-img-wrap {
    position: relative;
    aspect-ratio: 4/3;
    overflow: hidden;
    flex-shrink: 0;
  }
  .listing-img-wrap img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.5s var(--ease-smooth);
  }
  .listing-card-home:hover .listing-img-wrap img { transform: scale(1.06); }
  .listing-badge {
    position: absolute;
    top: 12px; left: 12px;
    background: var(--coral);
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 100px;
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }
  .listing-fav {
    position: absolute;
    top: 12px; right: 12px;
    width: 32px; height: 32px;
    background: rgba(255,255,255,0.9);
    backdrop-filter: blur(6px);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
    font-size: 1rem;
    transition: transform 0.2s var(--ease-spring);
  }
  .listing-fav:hover { transform: scale(1.15); }
  .listing-fav--active { background: #FFE5E5; }
  .listing-body {
    padding: 18px 20px 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }
  .listing-location {
    font-size: 0.72rem;
    color: var(--slate);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .listing-title-home {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 400;
    line-height: 1.3;
    color: var(--navy);
  }
  .listing-meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 4px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
  }
  .listing-price-home {
    font-weight: 700;
    font-size: 1rem;
    color: var(--navy);
  }
  .listing-price-home span {
    font-weight: 400;
    font-size: 0.8rem;
    color: var(--slate);
  }
  .listing-rating {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--navy);
  }
  .listing-rating-star { color: var(--gold); font-size: 0.9rem; }
  .listing-category-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: var(--sand);
    color: var(--slate);
    font-size: 0.7rem;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 100px;
    text-transform: capitalize;
  }

  /* ─── Ticker / marquee ───────────────────── */
  .ticker-wrap {
    background: var(--navy);
    overflow: hidden;
    padding: 16px 0;
  }
  .ticker-inner {
    display: flex;
    white-space: nowrap;
    animation: ticker 30s linear infinite;
    will-change: transform;
  }
  .ticker-inner:hover { animation-play-state: paused; }
  .ticker-item {
    display: inline-flex;
    align-items: center;
    gap: 16px;
    padding: 0 40px;
    color: rgba(255,255,255,0.7);
    font-size: 0.85rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .ticker-dot {
    width: 4px; height: 4px;
    background: var(--coral);
    border-radius: 50%;
  }

  /* ─── Value props ─────────────────────────── */
  .values-section {
    background: linear-gradient(135deg, var(--navy) 0%, #1a3a4a 100%);
    padding: 80px 0;
  }
  .values-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 48px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 40px;
  }
  .value-item {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 36px 28px;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    transition: all 0.25s;
  }
  .value-item:hover {
    background: rgba(255,255,255,0.07);
    border-color: rgba(255,90,95,0.3);
    transform: translateY(-4px);
  }
  .value-icon {
    width: 48px; height: 48px;
    background: rgba(255,90,95,0.15);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
  }
  .value-title {
    font-family: var(--font-display);
    font-size: 1.25rem;
    color: #fff;
    font-weight: 400;
  }
  .value-desc {
    font-size: 0.85rem;
    color: rgba(255,255,255,0.55);
    line-height: 1.7;
    font-weight: 300;
  }

  /* ─── CTA banner ─────────────────────────── */
  .cta-section {
    max-width: 1280px;
    margin: 80px auto;
    padding: 0 48px;
  }
  .cta-card {
    background: var(--coral);
    border-radius: 28px;
    padding: 72px 80px;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 48px;
    align-items: center;
    position: relative;
    overflow: hidden;
  }
  .cta-card::before {
    content: '';
    position: absolute;
    top: -40%;
    right: 0;
    width: 60%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
  }
  .cta-card::after {
    content: '';
    position: absolute;
    bottom: -60%;
    left: 10%;
    width: 40%;
    height: 150%;
    background: radial-gradient(circle, rgba(0,0,0,0.08) 0%, transparent 60%);
  }
  .cta-eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.7);
    margin-bottom: 16px;
  }
  .cta-title {
    font-family: var(--font-display);
    font-size: clamp(2rem, 3vw, 2.8rem);
    font-weight: 400;
    color: #fff;
    line-height: 1.15;
    margin-bottom: 16px;
  }
  .cta-subtitle {
    color: rgba(255,255,255,0.8);
    font-size: 1rem;
    font-weight: 300;
    line-height: 1.6;
  }
  .cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: #fff;
    color: var(--coral);
    padding: 16px 32px;
    border-radius: 100px;
    font-weight: 700;
    font-size: 0.9rem;
    text-decoration: none;
    transition: all 0.2s;
    white-space: nowrap;
    flex-shrink: 0;
    font-family: var(--font-body);
    border: none;
    cursor: pointer;
  }
  .cta-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.2);
  }

  /* ─── Responsive ─────────────────────────── */
  @media (max-width: 1024px) {
    .hero-content { grid-template-columns: 1fr; gap: 48px; padding: 100px 32px 60px; }
    .hero-visual { display: none; }
    .destinations-grid { grid-template-columns: repeat(2, 1fr); }
    .listings-grid-home { grid-template-columns: repeat(2, 1fr); }
    .values-inner { grid-template-columns: repeat(2, 1fr); }
    .cta-card { grid-template-columns: 1fr; padding: 48px; }
    .section { padding: 60px 32px; }
    .cats-inner { padding: 0 32px; }
  }
  @media (max-width: 640px) {
    .hero-title { font-size: 2.6rem; }
    .search-bar { flex-direction: column; border-radius: 20px; }
    .search-field { border-right: none; border-bottom: 1px solid var(--border); }
    .search-btn { border-radius: 0 0 20px 20px; padding: 16px; justify-content: center; }
    .destinations-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
    .listings-grid-home { grid-template-columns: 1fr; }
    .values-inner { grid-template-columns: 1fr; }
    .section { padding: 48px 20px; }
    .search-bar-wrap { padding: 0 16px; }
    .cta-card { padding: 36px 24px; }
  }
`;

// ─── Destination data (uses real listing data or falls back to placeholders) ──
const TRENDING_DESTINATIONS = [
  {
    city: "Bali",
    country: "Indonesia",
    tag: "Trending",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
    count: "240+ stays",
  },
  {
    city: "Santorini",
    country: "Greece",
    tag: "Popular",
    img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80",
    count: "180+ stays",
  },
  {
    city: "Kyoto",
    country: "Japan",
    tag: "Hidden gem",
    img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80",
    count: "120+ stays",
  },
  {
    city: "Tuscany",
    country: "Italy",
    tag: "Romantic",
    img: "https://images.unsplash.com/photo-1547754980-3df97fed72a8?w=600&q=80",
    count: "95+ stays",
  },
];

const CATEGORIES = [
  { key: null, icon: "⊞", label: "All" },
  { key: "trending", icon: "🔥", label: "Trending" },
  { key: "rooms", icon: "🛏", label: "Rooms" },
  { key: "iconic", icon: "🏙", label: "Iconic City" },
  { key: "mountains", icon: "⛰", label: "Mountains" },
  { key: "castles", icon: "🏰", label: "Castles" },
  { key: "pools", icon: "🏊", label: "Pools" },
  { key: "camping", icon: "⛺", label: "Camping" },
  { key: "farms", icon: "🐄", label: "Farms" },
  { key: "arctic", icon: "❄️", label: "Arctic" },
  { key: "domes", icon: "🛖", label: "Domes" },
  { key: "boats", icon: "⛵", label: "Boats" },
];

const VALUES = [
  {
    icon: "🛡️",
    title: "Verified Listings",
    desc: "Every property is reviewed and verified by our trust & safety team before going live.",
  },
  {
    icon: "💬",
    title: "24/7 Support",
    desc: "Real humans available around the clock. No bots — real help when you need it most.",
  },
  {
    icon: "🔑",
    title: "Flexible Booking",
    desc: "Change your plans? Most hosts offer free cancellation up to 48 hours before arrival.",
  },
  {
    icon: "🌍",
    title: "Local Experiences",
    desc: "Handpicked stays that put you in the heart of each destination's community.",
  },
];

const TICKER_ITEMS = [
  "10,000+ Properties",
  "180+ Countries",
  "Trusted by Millions",
  "Best Price Guarantee",
  "Instant Confirmation",
  "24/7 Support",
  "No Hidden Fees",
  "Verified Hosts",
  "Top Rated Stays",
];

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      style={{
        borderRadius: 20,
        overflow: "hidden",
        background: "#fff",
        border: "1px solid #E5E0D8",
      }}
    >
      <div className="skeleton" style={{ aspectRatio: "4/3", width: "100%" }} />
      <div
        style={{
          padding: "18px 20px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div
          className="skeleton"
          style={{ height: 12, width: "40%", borderRadius: 6 }}
        />
        <div
          className="skeleton"
          style={{ height: 18, width: "75%", borderRadius: 6 }}
        />
        <div
          className="skeleton"
          style={{ height: 14, width: "55%", borderRadius: 6 }}
        />
      </div>
    </div>
  );
}

// ─── Listing card ─────────────────────────────────────────────────────────────
function ListingCardHome({ listing, index }) {
  const [fav, setFav] = useState(false);
  const isNew = index < 3;
  const rating = (4.2 + Math.random() * 0.7).toFixed(1);
  const reviewCount = Math.floor(12 + Math.random() * 88);

  return (
    <Link
      to={`/listings/${listing._id}`}
      className="listing-card-home"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="listing-img-wrap">
        <img src={listing.image?.url} alt={listing.title} loading="lazy" />
        {isNew && <span className="listing-badge">New</span>}
        <button
          className={`listing-fav${fav ? " listing-fav--active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            setFav((f) => !f);
          }}
          aria-label="Save to wishlist"
        >
          {fav ? "❤️" : "🤍"}
        </button>
      </div>
      <div className="listing-body">
        <div className="listing-location">
          <span>📍</span>
          {listing.location}, {listing.country}
        </div>
        <h3 className="listing-title-home">{listing.title}</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="listing-category-chip">
            {CATEGORIES.find((c) => c.key === listing.category)?.icon ?? "🏠"}{" "}
            {listing.category || "stay"}
          </span>
        </div>
        <div className="listing-meta-row">
          <div className="listing-price-home">
            ₹{listing.price?.toLocaleString("en-IN")}
            <span> / night</span>
          </div>
          <div className="listing-rating">
            <span className="listing-rating-star">★</span>
            {rating}
            <span style={{ color: "#9CA3AF", fontWeight: 400 }}>
              ({reviewCount})
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Destination card ─────────────────────────────────────────────────────────
function DestinationCard({ dest, index }) {
  return (
    <Link
      to={`/listings?q=${dest.city}`}
      className="dest-card"
      style={{
        animationDelay: `${index * 0.1}s`,
        animation: "fadeUp 0.6s both",
      }}
    >
      <img src={dest.img} alt={dest.city} loading="lazy" />
      <div className="dest-card-gradient" />
      <span className="dest-card-tag">{dest.tag}</span>
      <div className="dest-card-info">
        <div className="dest-card-city">{dest.city}</div>
        <div className="dest-card-count">
          {dest.country} · {dest.count}
        </div>
      </div>
    </Link>
  );
}

// ─── Hero visual card ─────────────────────────────────────────────────────────
function HeroVisual({ listings }) {
  const cards = listings.slice(0, 3);
  if (cards.length < 2) return null;

  return (
    <div className="hero-visual">
      {cards[0] && (
        <div className="hero-card hero-card--large">
          <img src={cards[0].image?.url} alt={cards[0].title} />
          <div className="hero-card-overlay" />
          <div className="hero-card-label">
            <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
              {cards[0].title}
            </div>
            <div className="hero-card-price">
              ₹{cards[0].price?.toLocaleString("en-IN")} /night
            </div>
          </div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {cards[1] && (
          <div className="hero-card hero-card--sm">
            <img src={cards[1].image?.url} alt={cards[1].title} />
            <div className="hero-card-overlay" />
            <div className="hero-card-label">
              <div style={{ fontWeight: 600, fontSize: "0.82rem" }}>
                {cards[1].title}
              </div>
            </div>
          </div>
        )}
        {cards[2] && (
          <div className="hero-card hero-card--sm">
            <img src={cards[2].image?.url} alt={cards[2].title} />
            <div className="hero-card-overlay" />
            <div className="hero-card-label">
              <div style={{ fontWeight: 600, fontSize: "0.82rem" }}>
                {cards[2].title}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page component ──────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCountry, setSearchCountry] = useState("");
  const [visibleListings, setVisibleListings] = useState(6);

  // Fetch listings (compatible with existing hook)
  const { data: allData, isLoading } = useListings({
    category: activeCategory || undefined,
  });
  const { data: featuredData } = useListings({ limit: 6 });

  const listings = allData?.listings ?? [];
  const featured = featuredData?.listings?.slice(0, 6) ?? [];

  // Extract unique countries for search dropdown
  const countries = [...new Set(listings.map((l) => l.country))]
    .sort()
    .filter(Boolean);

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (searchCountry) params.set("country", searchCountry);
      if (activeCategory) params.set("category", activeCategory);
      navigate(`/listings?${params.toString()}`);
    },
    [searchQuery, searchCountry, activeCategory, navigate],
  );

  // Inject styles once
  useEffect(() => {
    const id = "wl-homepage-styles";
    if (!document.getElementById(id)) {
      const tag = document.createElement("style");
      tag.id = id;
      tag.textContent = STYLES;
      document.head.appendChild(tag);
    }
    return () => {
      // styles persist intentionally across SPA navigations
    };
  }, []);

  // Intersect observer for "load more" feel
  const loadMoreRef = useRef(null);
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting)
          setVisibleListings((v) => Math.min(v + 3, listings.length));
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [listings.length]);

  const displayedListings = listings.slice(0, visibleListings);

  return (
    <div className="wl-page">
      {/* ── HERO ────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              Over 10,000 verified properties
            </div>
            <h1 className="hero-title">
              Find your
              <br />
              <em>perfect</em> stay
              <br />
              anywhere
            </h1>
            <p className="hero-subtitle">
              Handpicked homes, villas, and unique stays for every kind of
              traveller. Book with confidence — real reviews, real hosts.
            </p>
            <div className="hero-cta-row">
              <Link to="/listings" className="btn-primary">
                Explore stays ↗
              </Link>
              <Link to="/listings/new" className="btn-ghost">
                + List your home
              </Link>
            </div>
            <div className="hero-stats">
              {[
                ["10K+", "Properties"],
                ["180+", "Countries"],
                ["4.9★", "Avg Rating"],
              ].map(([num, label]) => (
                <div key={label}>
                  <div className="hero-stat-num">{num}</div>
                  <div className="hero-stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
          <HeroVisual listings={featured} />
        </div>
      </section>

      {/* ── FLOATING SEARCH BAR ─────────────────────────── */}
      <div
        className="search-bar-wrap"
        style={{ maxWidth: 1000, margin: "-36px auto 0", padding: "0 24px" }}
      >
        <form className="search-bar" onSubmit={handleSearch}>
          <div className="search-field">
            <label>Where</label>
            <input
              type="text"
              placeholder="Search destinations…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="search-field">
            <label>Country</label>
            <select
              value={searchCountry}
              onChange={(e) => setSearchCountry(e.target.value)}
            >
              <option value="">All countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="search-field">
            <label>Category</label>
            <select
              value={activeCategory ?? ""}
              onChange={(e) => setActiveCategory(e.target.value || null)}
            >
              <option value="">All types</option>
              {CATEGORIES.filter((c) => c.key).map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <button className="search-btn" type="submit">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            Search
          </button>
        </form>
      </div>

      {/* ── TICKER ──────────────────────────────────────── */}
      <div className="ticker-wrap" style={{ marginTop: 64 }}>
        <div className="ticker-inner">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span className="ticker-item" key={i}>
              {item}
              {i !== TICKER_ITEMS.length * 2 - 1 && (
                <span className="ticker-dot" />
              )}
            </span>
          ))}
        </div>
      </div>

      {/* ── TRENDING DESTINATIONS ────────────────────────── */}
      <div className="section">
        <div className="section-header">
          <div>
            <div className="section-eyebrow">Discover the World</div>
            <h2 className="section-title">
              Trending <em>Destinations</em>
            </h2>
          </div>
          <Link to="/listings" className="view-all">
            View all →
          </Link>
        </div>
        <div className="destinations-grid">
          {TRENDING_DESTINATIONS.map((dest, i) => (
            <DestinationCard key={dest.city} dest={dest} index={i} />
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ──────────────────────────────────── */}
      <div className="cats-section">
        <div className="cats-inner">
          <div className="section-header" style={{ marginBottom: 0 }}>
            <div>
              <div className="section-eyebrow">Browse by Type</div>
              <h2 className="section-title">
                Find Your <em>Style</em>
              </h2>
            </div>
          </div>
          <div className="cats-scroll">
            {CATEGORIES.map(({ key, icon, label }) => (
              <button
                key={label}
                className={`cat-pill${activeCategory === key ? " cat-pill--active" : ""}`}
                onClick={() => setActiveCategory(key)}
              >
                <span className="cat-pill-icon">{icon}</span>
                <span className="cat-pill-label">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURED LISTINGS ───────────────────────────── */}
      <div className="section listings-section">
        <div className="section-header">
          <div>
            <div className="section-eyebrow">
              {activeCategory
                ? `${CATEGORIES.find((c) => c.key === activeCategory)?.label ?? ""} Stays`
                : "Featured Stays"}
            </div>
            <h2 className="section-title">
              {activeCategory ? "Filtered" : "Hand-Picked"} <em>for You</em>
            </h2>
          </div>
          <Link to="/listings" className="view-all">
            All {listings.length > 0 ? `${listings.length} ` : ""}listings →
          </Link>
        </div>

        {isLoading ? (
          <div className="listings-grid-home">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : displayedListings.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "60px 0", color: "#9CA3AF" }}
          >
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔍</div>
            <p
              style={{ fontSize: "1.1rem", fontFamily: "var(--font-display)" }}
            >
              No listings found
            </p>
            <button
              style={{
                marginTop: 20,
                color: THEME.coral,
                border: `1.5px solid ${THEME.coral}`,
                borderRadius: 100,
                padding: "10px 24px",
                background: "transparent",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
              }}
              onClick={() => setActiveCategory(null)}
            >
              Clear filter
            </button>
          </div>
        ) : (
          <>
            <div className="listings-grid-home">
              {displayedListings.map((listing, i) => (
                <ListingCardHome
                  key={listing._id}
                  listing={listing}
                  index={i}
                />
              ))}
            </div>
            {visibleListings < listings.length && (
              <div
                ref={loadMoreRef}
                style={{ textAlign: "center", marginTop: 48 }}
              >
                <button
                  className="btn-primary"
                  onClick={() => setVisibleListings((v) => v + 6)}
                  style={{ margin: "0 auto" }}
                >
                  Load more stays
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── VALUE PROPS ─────────────────────────────────── */}
      <div className="values-section">
        <div className="values-inner">
          {VALUES.map((v) => (
            <div key={v.title} className="value-item">
              <div className="value-icon">{v.icon}</div>
              <div className="value-title">{v.title}</div>
              <div className="value-desc">{v.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA BANNER ──────────────────────────────────── */}
      <div className="cta-section">
        <div className="cta-card">
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="cta-eyebrow">Become a Host</div>
            <h2 className="cta-title">
              Your home could be
              <br />
              someone's dream stay
            </h2>
            <p className="cta-subtitle">
              Join thousands of hosts earning extra income by sharing their
              spaces. It's free to list, and you set your own rules.
            </p>
          </div>
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              alignItems: "flex-start",
            }}
          >
            <Link to="/listings/new" className="cta-btn">
              Start hosting →
            </Link>
            <p
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: "0.8rem",
                fontWeight: 300,
                lineHeight: 1.5,
              }}
            >
              Free to list · No commission until you earn
            </p>
          </div>
        </div>
      </div>

      {/* bottom spacer */}
      <div style={{ height: 40 }} />
    </div>
  );
}
