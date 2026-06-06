import { useState } from "react";
import {
  Divider,
  Chip,
  Alert,
  LinearProgress,
  Avatar,
  Badge,
  Tabs,
  Tab,
  Tooltip,
  Typography,
  Box,
  Stack,
  Grid,
} from "@mui/material";
import {
  Compass,
  PlusCircle,
  Trash2,
  Edit2,
  Search,
  TrendingUp,
  Star,
  Home,
  MapPin,
  Eye,
} from "lucide-react";

import { Button, LoadingButton, IconButton } from "../components/ui/Button";
import { Input, Textarea, Select, SearchInput } from "../components/ui/Input";
import { Card, StatsCard } from "../components/ui/Card";
import { Modal, ConfirmModal, AlertModal } from "../components/ui/Modal";
import { Table } from "../components/ui/Table";
import { colors } from "../theme/tokens";

// ── Sample data ───────────────────────────────────────────────────────────────
const SAMPLE_LISTINGS = [
  {
    _id: "1",
    title: "Mountain Retreat",
    country: "India",
    price: 3200,
    category: "mountains",
    status: "active",
  },
  {
    _id: "2",
    title: "Coastal Villa",
    country: "Greece",
    price: 8500,
    category: "iconic",
    status: "active",
  },
  {
    _id: "3",
    title: "Arctic Dome",
    country: "Norway",
    price: 12000,
    category: "arctic",
    status: "draft",
  },
  {
    _id: "4",
    title: "Bamboo Farm Stay",
    country: "Japan",
    price: 2100,
    category: "farms",
    status: "active",
  },
  {
    _id: "5",
    title: "Castle Suite",
    country: "Ireland",
    price: 9900,
    category: "castles",
    status: "inactive",
  },
];

const TABLE_COLS = [
  { key: "title", label: "Title", sortable: true },
  { key: "country", label: "Country", sortable: true },
  {
    key: "price",
    label: "Price / night",
    sortable: true,
    render: (r) => `₹${r.price.toLocaleString("en-IN")}`,
  },
  {
    key: "status",
    label: "Status",
    render: (r) => (
      <Chip
        label={r.status}
        size="small"
        sx={{
          fontWeight: 600,
          fontSize: "0.72rem",
          borderRadius: "999px",
          bgcolor:
            r.status === "active"
              ? "#dcfce7"
              : r.status === "draft"
                ? "#fef9c3"
                : "#fee2e2",
          color:
            r.status === "active"
              ? "#15803d"
              : r.status === "draft"
                ? "#b45309"
                : "#b91c1c",
        }}
      />
    ),
  },
  {
    key: "actions",
    label: "",
    render: () => (
      <Stack direction="row" spacing={0.5}>
        <IconButton color="primary" label="View" size="sm">
          <Eye size={15} />
        </IconButton>
        <IconButton color="primary" label="Edit" size="sm">
          <Edit2 size={15} />
        </IconButton>
        <IconButton color="danger" label="Delete" size="sm">
          <Trash2 size={15} />
        </IconButton>
      </Stack>
    ),
  },
];

const SELECT_OPTS = [
  { value: "mountains", label: "Mountains" },
  { value: "arctic", label: "Arctic" },
  { value: "iconic", label: "Iconic City" },
  { value: "farms", label: "Farms" },
];

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <Box component="section" sx={{ mb: 8 }}>
      <Typography
        variant="overline"
        sx={{
          color: colors.brand[500],
          fontWeight: 700,
          letterSpacing: "0.12em",
          mb: 1,
          display: "block",
        }}
      >
        {title}
      </Typography>
      <Divider sx={{ mb: 4 }} />
      {children}
    </Box>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DesignSystemPage() {
  // Modal state
  const [modal, setModal] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [alert, setAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [inputVal, setInputVal] = useState("");
  const [textVal, setTextVal] = useState("");
  const [selectVal, setSelectVal] = useState("");
  const [search, setSearch] = useState("");
  const [tabIdx, setTabIdx] = useState(0);

  // Simulate loading button
  const handleLoadingBtn = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setConfirm(false);
    }, 1500);
  };

  return (
    <Box
      sx={{
        maxWidth: 1100,
        mx: "auto",
        px: { xs: 3, md: 6 },
        py: 8,
      }}
    >
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <Box sx={{ mb: 10 }}>
        <Stack direction="row" alignItems="center" gap={1.5} mb={1}>
          <Compass size={32} style={{ color: colors.brand[500] }} />
          <Typography variant="h1" sx={{ fontSize: "2.5rem" }}>
            Wanderlust Design System
          </Typography>
        </Stack>
        <Typography variant="subtitle1" sx={{ maxWidth: 520 }}>
          MUI + Tailwind CSS component library. All tokens, variants, and states
          in one place.
        </Typography>
      </Box>

      {/* ── Color Palette ──────────────────────────────────────────────────── */}
      <Section title="Color Palette">
        <Grid container spacing={2}>
          {/* Brand */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Brand
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {Object.entries(colors.brand).map(([shade, hex]) => (
                <Tooltip key={shade} title={`brand.${shade} — ${hex}`} arrow>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "10px",
                      bgcolor: hex,
                      border:
                        shade === "0"
                          ? `1px solid ${colors.neutral[200]}`
                          : "none",
                      cursor: "default",
                      transition: "transform 140ms",
                      "&:hover": { transform: "scale(1.1)" },
                    }}
                  />
                </Tooltip>
              ))}
            </Stack>
          </Grid>
          {/* Neutral */}
          <Grid item xs={12} mt={1}>
            <Typography variant="h6" gutterBottom>
              Neutral
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {Object.entries(colors.neutral).map(([shade, hex]) => (
                <Tooltip key={shade} title={`neutral.${shade} — ${hex}`} arrow>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "10px",
                      bgcolor: hex,
                      border: `1px solid ${colors.neutral[200]}`,
                      cursor: "default",
                      transition: "transform 140ms",
                      "&:hover": { transform: "scale(1.1)" },
                    }}
                  />
                </Tooltip>
              ))}
            </Stack>
          </Grid>
          {/* Semantic */}
          <Grid item xs={12} mt={1}>
            <Typography variant="h6" gutterBottom>
              Semantic
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={2}>
              {[
                { name: "Success", c: colors.success },
                { name: "Warning", c: colors.warning },
                { name: "Error", c: colors.error },
                { name: "Info", c: colors.info },
              ].map(({ name, c }) => (
                <Stack key={name} direction="row" gap={0.5} alignItems="center">
                  {["light", "main", "dark"].map((k) => (
                    <Tooltip
                      key={k}
                      title={`${name.toLowerCase()}.${k} — ${c[k]}`}
                      arrow
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "8px",
                          bgcolor: c[k],
                          border: `1px solid ${colors.neutral[200]}`,
                        }}
                      />
                    </Tooltip>
                  ))}
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    {name}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Section>

      {/* ── Typography ─────────────────────────────────────────────────────── */}
      <Section title="Typography">
        <Stack spacing={3}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              Display (DM Serif Display)
            </Typography>
            {["h1", "h2", "h3"].map((v) => (
              <Typography key={v} variant={v} sx={{ mt: 1 }}>
                {v.toUpperCase()} — Explore the world
              </Typography>
            ))}
          </Box>
          <Divider />
          <Box>
            <Typography variant="overline" color="text.secondary">
              Body (Plus Jakarta Sans)
            </Typography>
            <Stack spacing={1.5} mt={1}>
              {["h4", "h5", "h6", "body1", "body2", "caption", "overline"].map(
                (v) => (
                  <Typography key={v} variant={v}>
                    <strong>{v}</strong> — The quick brown fox jumps over the
                    lazy dog
                  </Typography>
                ),
              )}
            </Stack>
          </Box>
        </Stack>
      </Section>

      {/* ── Buttons ────────────────────────────────────────────────────────── */}
      <Section title="Buttons">
        {/* Variants */}
        <Typography variant="h6" gutterBottom>
          Variants
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={2} mb={4}>
          <Button variant="primary">Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="link">Link</Button>
        </Stack>

        {/* Sizes */}
        <Typography variant="h6" gutterBottom>
          Sizes
        </Typography>
        <Stack
          direction="row"
          flexWrap="wrap"
          gap={2}
          alignItems="center"
          mb={4}
        >
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="primary" size="md">
            Medium
          </Button>
          <Button variant="primary" size="lg">
            Large
          </Button>
        </Stack>

        {/* With icons */}
        <Typography variant="h6" gutterBottom>
          With Icons
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={2} mb={4}>
          <Button variant="primary" startIcon={<PlusCircle size={16} />}>
            New Listing
          </Button>
          <Button variant="secondary" startIcon={<Edit2 size={16} />}>
            Edit
          </Button>
          <Button variant="danger" startIcon={<Trash2 size={16} />}>
            Delete
          </Button>
        </Stack>

        {/* States */}
        <Typography variant="h6" gutterBottom>
          States
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={2} mb={4}>
          <Button variant="primary" disabled>
            Disabled
          </Button>
          <LoadingButton
            variant="primary"
            loading={loading}
            onClick={handleLoadingBtn}
          >
            {loading ? "" : "Click to load"}
          </LoadingButton>
          <Button variant="primary" fullWidth>
            Full width
          </Button>
        </Stack>

        {/* Icon buttons */}
        <Typography variant="h6" gutterBottom>
          Icon Buttons
        </Typography>
        <Stack direction="row" gap={1}>
          <IconButton label="Search" color="primary">
            <Search size={18} />
          </IconButton>
          <IconButton label="Home" color="primary">
            <Home size={18} />
          </IconButton>
          <IconButton label="Delete" color="danger">
            <Trash2 size={18} />
          </IconButton>
          <IconButton label="Default">
            <Star size={18} />
          </IconButton>
        </Stack>
      </Section>

      {/* ── Inputs ─────────────────────────────────────────────────────────── */}
      <Section title="Form Inputs">
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Input
              label="Destination"
              placeholder="e.g. Manali, Himachal Pradesh"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              hint="Enter a city or region"
              startAdornment={
                <MapPin size={16} style={{ color: colors.neutral[400] }} />
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Input
              label="Price"
              type="number"
              placeholder="1200"
              error="Price must be greater than 0"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Select
              label="Category"
              options={SELECT_OPTS}
              placeholder="Select a category"
              value={selectVal}
              onChange={(e) => setSelectVal(e.target.value)}
              hint="Choose the listing type"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Select
              label="Category (error)"
              options={SELECT_OPTS}
              placeholder="Select a category"
              value=""
              onChange={() => {}}
              error="Please select a category"
            />
          </Grid>
          <Grid item xs={12}>
            <Textarea
              label="Description"
              placeholder="Describe your listing in detail…"
              value={textVal}
              onChange={(e) => setTextVal(e.target.value)}
              rows={4}
              hint={`${textVal.length} / 500 characters`}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search destinations…"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Input label="Disabled field" value="Read-only value" disabled />
          </Grid>
        </Grid>
      </Section>

      {/* ── Cards ──────────────────────────────────────────────────────────── */}
      <Section title="Cards">
        <Typography variant="h6" gutterBottom>
          Base Card Variants
        </Typography>
        <Grid container spacing={3} mb={5}>
          {["flat", "raised", "hover"].map((v) => (
            <Grid item xs={12} sm={4} key={v}>
              <Card variant={v}>
                <Box sx={{ p: 3 }}>
                  <Typography variant="overline" color="text.secondary">
                    {v}
                  </Typography>
                  <Typography variant="h5" mt={0.5}>
                    Card title
                  </Typography>
                  <Typography variant="body2" mt={1} color="text.secondary">
                    Use the <code>{v}</code> variant for this context. Hover to
                    see the effect.
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h6" gutterBottom>
          Stats Cards
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              label="Total Listings"
              value="128"
              icon={<Home size={18} />}
              trend="up"
              trendValue="+12 this week"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              label="Avg. Rating"
              value="4.7"
              icon={<Star size={18} />}
              trend="up"
              trendValue="+0.2 pts"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              label="Reviews"
              value="1,042"
              icon={<Eye size={18} />}
              trend="down"
              trendValue="-3 this month"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              label="Countries"
              value="34"
              icon={<MapPin size={18} />}
              trend="flat"
              trendValue="No change"
            />
          </Grid>
        </Grid>
      </Section>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <Section title="Modals">
        <Stack direction="row" flexWrap="wrap" gap={2}>
          <Button variant="primary" onClick={() => setModal(true)}>
            Open General Modal
          </Button>
          <Button variant="danger" onClick={() => setConfirm(true)}>
            Open Confirm Modal
          </Button>
          <Button variant="outline" onClick={() => setAlert(true)}>
            Open Alert Modal
          </Button>
        </Stack>

        {/* General */}
        <Modal
          open={modal}
          onClose={() => setModal(false)}
          title="Edit Listing Details"
          maxWidth="sm"
          actions={
            <>
              <Button variant="ghost" onClick={() => setModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setModal(false)}>
                Save Changes
              </Button>
            </>
          }
        >
          <Stack spacing={3} pt={1}>
            <Input label="Title" defaultValue="Mountain Retreat" />
            <Select
              label="Category"
              options={SELECT_OPTS}
              value={selectVal || "mountains"}
              onChange={(e) => setSelectVal(e.target.value)}
            />
            <Textarea
              label="Description"
              defaultValue="Peaceful cabin surrounded by pines."
              rows={3}
            />
          </Stack>
        </Modal>

        {/* Confirm */}
        <ConfirmModal
          open={confirm}
          onClose={() => setConfirm(false)}
          onConfirm={handleConfirm}
          loading={loading}
          title="Delete this listing?"
          message="This action is permanent and cannot be undone. All associated reviews will also be removed."
          confirmLabel="Yes, delete"
          confirmVariant="danger"
        />

        {/* Alert */}
        <AlertModal
          open={alert}
          onClose={() => setAlert(false)}
          severity="warning"
          title="Image too large"
          message="Your file exceeds the 10 MB limit. Please compress it and try again."
        />
      </Section>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <Section title="Data Table">
        <Typography variant="h6" gutterBottom>
          Listings Table (sortable, with actions)
        </Typography>
        <Table
          columns={TABLE_COLS}
          rows={SAMPLE_LISTINGS}
          rowKey="_id"
          emptyMessage="No listings found."
          sx={{ mb: 4 }}
        />

        <Typography variant="h6" gutterBottom>
          Loading State
        </Typography>
        <Table
          columns={TABLE_COLS}
          rows={[]}
          rowKey="_id"
          loading={true}
          skeletonRows={3}
        />
      </Section>

      {/* ── MUI Primitives ─────────────────────────────────────────────────── */}
      <Section title="MUI Primitives (themed)">
        {/* Tabs */}
        <Typography variant="h6" gutterBottom>
          Tabs
        </Typography>
        <Tabs value={tabIdx} onChange={(_, v) => setTabIdx(v)} sx={{ mb: 3 }}>
          <Tab label="All Listings" />
          <Tab label="My Listings" />
          <Tab label="Saved" />
        </Tabs>

        {/* Alerts */}
        <Typography variant="h6" gutterBottom>
          Alerts
        </Typography>
        <Stack spacing={2} mb={4}>
          <Alert severity="success">Listing created successfully!</Alert>
          <Alert severity="error">Upload failed — only JPG/PNG allowed.</Alert>
          <Alert severity="warning">
            Your session will expire in 5 minutes.
          </Alert>
          <Alert severity="info">
            Tip: fill in your location accurately for better map results.
          </Alert>
        </Stack>

        {/* Chips */}
        <Typography variant="h6" gutterBottom>
          Chips
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1} mb={4}>
          <Chip label="Mountains" color="primary" />
          <Chip label="Arctic" variant="outlined" color="primary" />
          <Chip
            label="Trending"
            icon={<TrendingUp size={14} />}
            color="primary"
          />
          <Chip
            label="Active"
            sx={{ bgcolor: "#dcfce7", color: "#15803d", fontWeight: 600 }}
          />
          <Chip
            label="Draft"
            sx={{ bgcolor: "#fef9c3", color: "#b45309", fontWeight: 600 }}
          />
          <Chip
            label="Inactive"
            sx={{ bgcolor: "#fee2e2", color: "#b91c1c", fontWeight: 600 }}
          />
        </Stack>

        {/* Progress */}
        <Typography variant="h6" gutterBottom>
          Progress
        </Typography>
        <Stack spacing={2} mb={4} maxWidth={500}>
          <LinearProgress variant="determinate" value={70} />
          <LinearProgress variant="determinate" value={35} />
          <LinearProgress variant="indeterminate" />
        </Stack>

        {/* Avatars & Badges */}
        <Typography variant="h6" gutterBottom>
          Avatars &amp; Badges
        </Typography>
        <Stack direction="row" gap={2} alignItems="center" mb={4}>
          <Avatar>AK</Avatar>
          <Avatar sx={{ bgcolor: colors.brand[500] }}>WL</Avatar>
          <Badge badgeContent={4} color="primary">
            <Avatar sx={{ bgcolor: colors.neutral[700] }}>JS</Avatar>
          </Badge>
          <Badge variant="dot" color="success">
            <Avatar>MN</Avatar>
          </Badge>
        </Stack>
      </Section>

      {/* ── Spacing & Radius reference ──────────────────────────────────────── */}
      <Section title="Spacing Scale">
        <Stack direction="row" flexWrap="wrap" gap={2} alignItems="flex-end">
          {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map((s) => (
            <Tooltip key={s} title={`space-${s} = ${s * 4}px`} arrow>
              <Box
                sx={{
                  width: s * 4,
                  height: s * 4,
                  bgcolor: colors.brand[200],
                  borderRadius: "4px",
                  cursor: "default",
                }}
              />
            </Tooltip>
          ))}
        </Stack>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          Hover each box to see the token name and px value.
        </Typography>
      </Section>

      <Section title="Border Radii">
        <Stack direction="row" flexWrap="wrap" gap={3} alignItems="center">
          {[
            { name: "sm", r: "4px" },
            { name: "md", r: "8px" },
            { name: "lg", r: "12px" },
            { name: "xl", r: "18px" },
            { name: "2xl", r: "24px" },
            { name: "3xl", r: "32px" },
            { name: "full", r: "9999px" },
          ].map(({ name, r }) => (
            <Tooltip key={name} title={`${name} = ${r}`} arrow>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: colors.brand[100],
                  border: `2px solid ${colors.brand[300]}`,
                  borderRadius: r,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "default",
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color={colors.brand[700]}
                >
                  {name}
                </Typography>
              </Box>
            </Tooltip>
          ))}
        </Stack>
      </Section>
    </Box>
  );
}
