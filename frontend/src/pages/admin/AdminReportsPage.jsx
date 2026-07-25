import { useState } from "react";
import { Box, Typography, Chip, Stack, Tabs, Tab } from "@mui/material";
import { Flag, Check, X } from "lucide-react";
import { Link } from "react-router-dom";

import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Select, Textarea } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/EmptyState";
import { useReports, useResolveReport } from "../../hooks/useReports";
import { neutral, brand, radii } from "../../theme/tokens";

const PAGE_LIMIT = 20;

const STATUS_TABS = [
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
];

const REASON_LABELS = {
  spam: "Spam",
  inappropriate: "Inappropriate content",
  fraud: "Fraud",
  fake: "Fake listing/review",
  harassment: "Harassment",
  other: "Other",
};

const ACTION_OPTIONS = [
  { value: "none", label: "No action" },
  { value: "content_removed", label: "Remove content" },
  { value: "user_suspended", label: "Suspend user" },
  { value: "warning_issued", label: "Issue warning" },
];

function TargetPreview({ report }) {
  if (!report.target) {
    return (
      <Typography variant="caption" sx={{ color: neutral[400] }}>
        Content no longer available
      </Typography>
    );
  }

  if (report.targetType === "listing") {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {report.target.image && (
          <Box
            component="img"
            src={report.target.image}
            alt=""
            sx={{ width: 36, height: 36, borderRadius: "8px", objectFit: "cover" }}
          />
        )}
        <Typography
          component={Link}
          to={`/listings/${report.target.id}`}
          target="_blank"
          sx={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: neutral[800],
            textDecoration: "none",
            "&:hover": { color: brand[600] },
          }}
        >
          {report.target.title}
        </Typography>
      </Box>
    );
  }

  if (report.targetType === "review") {
    return (
      <Typography
        variant="body2"
        sx={{
          color: neutral[600],
          maxWidth: 260,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        "{report.target.comment}" ({report.target.rating}★)
      </Typography>
    );
  }

  return (
    <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: neutral[800] }}>
      @{report.target.username}
    </Typography>
  );
}

function ResolveModal({ report, onClose }) {
  const [resolutionAction, setResolutionAction] = useState("none");
  const [resolutionNote, setResolutionNote] = useState("");
  const { mutate: resolve, isPending } = useResolveReport();

  if (!report) return null;

  return (
    <Modal
      open={Boolean(report)}
      onClose={onClose}
      title="Review this report"
      maxWidth="sm"
      actions={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="outline"
            loading={isPending}
            onClick={() =>
              resolve(
                { id: report._id, payload: { status: "dismissed", resolutionAction: "none", resolutionNote } },
                { onSuccess: onClose },
              )
            }
          >
            Dismiss report
          </Button>
          <Button
            variant="primary"
            loading={isPending}
            onClick={() =>
              resolve(
                { id: report._id, payload: { status: "resolved", resolutionAction, resolutionNote } },
                { onSuccess: onClose },
              )
            }
          >
            Resolve
          </Button>
        </>
      }
    >
      <Stack spacing={2.5} pt={1}>
        <Box>
          <Typography variant="overline" sx={{ color: neutral[500] }}>
            Reported {report.targetType}
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <TargetPreview report={report} />
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="caption" sx={{ color: neutral[500], display: "block" }}>
              Reason
            </Typography>
            <Chip
              label={REASON_LABELS[report.reason] ?? report.reason}
              size="small"
              sx={{ mt: 0.5, fontWeight: 700 }}
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: neutral[500], display: "block" }}>
              Reported by
            </Typography>
            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, mt: 0.5 }}>
              @{report.reportedBy?.username ?? "unknown"}
            </Typography>
          </Box>
        </Box>

        {report.description && (
          <Box>
            <Typography variant="caption" sx={{ color: neutral[500], display: "block", mb: 0.5 }}>
              Reporter's notes
            </Typography>
            <Typography variant="body2" sx={{ color: neutral[700], bgcolor: neutral[50], p: 1.5, borderRadius: radii.md }}>
              {report.description}
            </Typography>
          </Box>
        )}

        <Select
          label="Action to take"
          options={ACTION_OPTIONS}
          value={resolutionAction}
          onChange={(e) => setResolutionAction(e.target.value)}
          hint="Applied only if you click Resolve. Dismiss ignores this."
        />

        <Textarea
          label="Resolution note (optional)"
          placeholder="Internal note about how this was handled…"
          rows={3}
          value={resolutionNote}
          onChange={(e) => setResolutionNote(e.target.value)}
        />
      </Stack>
    </Modal>
  );
}

export default function AdminReportsPage() {
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [activeReport, setActiveReport] = useState(null);

  const { data, isLoading } = useReports({ status, page, limit: PAGE_LIMIT });

  const reports = data?.reports ?? [];
  const pagination = data?.pagination;

  const columns = [
    {
      key: "targetType",
      label: "Type",
      render: (row) => (
        <Chip label={row.targetType} size="small" sx={{ textTransform: "capitalize", fontWeight: 700 }} />
      ),
    },
    { key: "target", label: "Content", render: (row) => <TargetPreview report={row} /> },
    {
      key: "reason",
      label: "Reason",
      render: (row) => REASON_LABELS[row.reason] ?? row.reason,
    },
    {
      key: "reportedBy",
      label: "Reported by",
      render: (row) => (row.reportedBy ? `@${row.reportedBy.username}` : "—"),
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (row) =>
        new Date(row.createdAt).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      key: "actions",
      label: "",
      render: (row) =>
        row.status === "pending" ? (
          <Button variant="outline" size="sm" onClick={() => setActiveReport(row)}>
            Review
          </Button>
        ) : (
          <Chip
            icon={row.status === "resolved" ? <Check size={12} /> : <X size={12} />}
            label={row.status}
            size="small"
            sx={{
              textTransform: "capitalize",
              fontWeight: 700,
              bgcolor: row.status === "resolved" ? "#dcfce7" : "#f4f1ee",
              color: row.status === "resolved" ? "#15803d" : neutral[600],
            }}
          />
        ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Tabs
        value={status}
        onChange={(_, v) => {
          setStatus(v);
          setPage(1);
        }}
      >
        {STATUS_TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} />
        ))}
      </Tabs>

      {!isLoading && reports.length === 0 ? (
        <EmptyState
          variant="generic"
          icon={<Flag size={36} />}
          title={status === "pending" ? "No pending reports" : `No ${status} reports`}
          body="Reported listings, reviews, and users will appear here for moderation."
        />
      ) : (
        <Table
          columns={columns}
          rows={reports}
          rowKey="_id"
          loading={isLoading}
          skeletonRows={6}
          emptyMessage="No reports found."
          pagination={
            pagination?.totalPages > 1
              ? { page, totalPages: pagination.totalPages, onChange: setPage }
              : undefined
          }
        />
      )}

      <ResolveModal report={activeReport} onClose={() => setActiveReport(null)} />
    </Box>
  );
}
