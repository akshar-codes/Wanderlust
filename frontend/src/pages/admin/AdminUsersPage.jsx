import { useState } from "react";
import { Box, Typography, Chip, Stack } from "@mui/material";
import { ShieldCheck, ShieldOff, Search } from "lucide-react";

import { Table } from "../../components/ui/Table";
import { Button } from "../../components/ui/Button";
import { SearchInput, Select } from "../../components/ui/Input";
import { ConfirmModal } from "../../components/ui/Modal";
import { useAdminUsers, useUpdateUserStatus } from "../../hooks/useAdmin";
import { neutral } from "../../theme/tokens";

const ROLE_OPTIONS = [
  { value: "", label: "All roles" },
  { value: "user", label: "User" },
  { value: "host", label: "Host" },
  { value: "admin", label: "Admin" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

const PAGE_LIMIT = 20;

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [pendingAction, setPendingAction] = useState(null); // { user, nextIsActive }

  const { data, isLoading } = useAdminUsers({
    page,
    limit: PAGE_LIMIT,
    search: search || undefined,
    role: role || undefined,
    status: status || undefined,
  });
  const { mutate: updateStatus, isPending: updating } = useUpdateUserStatus();

  const users = data?.users ?? [];
  const pagination = data?.pagination;

  const columns = [
    {
      key: "username",
      label: "User",
      render: (row) => (
        <Box sx={{ minWidth: 180 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.8125rem", color: neutral[800] }}>
            {row.firstName ? `${row.firstName} ${row.lastName ?? ""}` : `@${row.username}`}
          </Typography>
          <Typography variant="caption" sx={{ color: neutral[500] }}>
            {row.email}
          </Typography>
        </Box>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (row) => (
        <Chip
          label={row.role}
          size="small"
          sx={{
            textTransform: "capitalize",
            fontWeight: 700,
            bgcolor: row.role === "admin" ? "#ede9fe" : row.role === "host" ? "#dbeafe" : neutral[100],
            color: row.role === "admin" ? "#6d28d9" : row.role === "host" ? "#1e40af" : neutral[700],
          }}
        />
      ),
    },
    {
      key: "emailVerified",
      label: "Verified",
      render: (row) =>
        row.emailVerified ? (
          <Chip label="Verified" size="small" sx={{ bgcolor: "#dcfce7", color: "#15803d", fontWeight: 700 }} />
        ) : (
          <Chip label="Unverified" size="small" sx={{ bgcolor: "#fef9c3", color: "#b45309", fontWeight: 700 }} />
        ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (row) =>
        row.isActive ? (
          <Chip label="Active" size="small" sx={{ bgcolor: "#dcfce7", color: "#15803d", fontWeight: 700 }} />
        ) : (
          <Chip label="Suspended" size="small" sx={{ bgcolor: "#fee2e2", color: "#b91c1c", fontWeight: 700 }} />
        ),
    },
    {
      key: "createdAt",
      label: "Joined",
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
        row.role === "admin" ? (
          <Typography variant="caption" sx={{ color: neutral[400] }}>
            —
          </Typography>
        ) : (
          <Stack direction="row" spacing={0.5}>
            {row.isActive ? (
              <Button
                variant="ghost"
                size="sm"
                startIcon={<ShieldOff size={13} />}
                sx={{ color: "error.main" }}
                onClick={() => setPendingAction({ user: row, nextIsActive: false })}
              >
                Suspend
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                startIcon={<ShieldCheck size={13} />}
                onClick={() => setPendingAction({ user: row, nextIsActive: true })}
              >
                Reactivate
              </Button>
            )}
          </Stack>
        ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <SearchInput
            fullWidth
            placeholder="Search by username, email, or name…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            startAdornment={<Search size={16} color={neutral[400]} />}
          />
        </Box>
        <Box sx={{ width: 160 }}>
          <Select
            options={ROLE_OPTIONS}
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
          />
        </Box>
        <Box sx={{ width: 170 }}>
          <Select
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          />
        </Box>
      </Box>

      <Table
        columns={columns}
        rows={users}
        rowKey="_id"
        loading={isLoading}
        skeletonRows={8}
        emptyMessage="No users found."
        pagination={
          pagination?.totalPages > 1
            ? { page, totalPages: pagination.totalPages, onChange: setPage }
            : undefined
        }
      />

      <ConfirmModal
        open={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        onConfirm={() => {
          if (!pendingAction) return;
          updateStatus(
            { username: pendingAction.user.username, isActive: pendingAction.nextIsActive },
            { onSuccess: () => setPendingAction(null) },
          );
        }}
        loading={updating}
        title={pendingAction?.nextIsActive ? "Reactivate this user?" : "Suspend this user?"}
        message={
          pendingAction?.nextIsActive
            ? "This will restore the user's access to their account."
            : "This will immediately sign the user out and block access to their account until reactivated."
        }
        confirmLabel={pendingAction?.nextIsActive ? "Yes, reactivate" : "Yes, suspend"}
        confirmVariant={pendingAction?.nextIsActive ? "primary" : "danger"}
      />
    </Box>
  );
}
