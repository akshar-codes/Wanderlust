import { useState } from "react";
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Skeleton,
  Pagination,
  Box,
  Typography,
} from "@mui/material";
import { colors, radii } from "../../theme/tokens";

// ── Helper: stable sort ───────────────────────────────────────────────────────
function stableSort(array, comparator) {
  const stabilized = array.map((el, i) => [el, i]);
  stabilized.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    return order !== 0 ? order : a[1] - b[1];
  });
  return stabilized.map((el) => el[0]);
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => (b[orderBy] < a[orderBy] ? -1 : b[orderBy] > a[orderBy] ? 1 : 0)
    : (a, b) =>
        a[orderBy] < b[orderBy] ? -1 : a[orderBy] > b[orderBy] ? 1 : 0;
}

// ── Table ─────────────────────────────────────────────────────────────────────
/**
 * @param {{ key: string, label: string, sortable?: boolean,
 *            width?: string|number, align?: "left"|"center"|"right",
 *            render?: (row) => React.ReactNode }[]} columns
 * @param {object[]}  rows
 * @param {string}    rowKey         — field used as React key (e.g. "_id")
 * @param {boolean}   loading
 * @param {number}    skeletonRows   — how many skeleton rows to show while loading
 * @param {string}    emptyMessage
 * @param {Function}  onRowClick
 * @param {{ page: number, totalPages: number, onChange: (p)=>void }} pagination
 */
export function Table({
  columns = [],
  rows = [],
  rowKey = "id",
  loading = false,
  skeletonRows = 5,
  emptyMessage = "No data available.",
  onRowClick,
  pagination,
  stickyHeader = false,
  maxHeight,
  sx,
}) {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState(null);

  const handleSort = (col) => {
    if (!col.sortable) return;
    const isAsc = orderBy === col.key && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(col.key);
  };

  const sortedRows = orderBy
    ? stableSort(rows, getComparator(order, orderBy))
    : rows;

  return (
    <Box sx={{ width: "100%", ...sx }}>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: radii.xl,
          border: `1px solid ${colors.neutral[200]}`,
          overflow: "hidden",
          ...(maxHeight ? { maxHeight, overflow: "auto" } : {}),
        }}
      >
        <MuiTable stickyHeader={stickyHeader} aria-label="data table">
          {/* ── Head ─────────────────────────────────────────────────── */}
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align ?? "left"}
                  sortDirection={orderBy === col.key ? order : false}
                  sx={{
                    width: col.width,
                    background: colors.neutral[50],
                    borderBottom: `2px solid ${colors.neutral[200]}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.sortable ? (
                    <TableSortLabel
                      active={orderBy === col.key}
                      direction={orderBy === col.key ? order : "asc"}
                      onClick={() => handleSort(col)}
                      sx={{
                        "& .MuiTableSortLabel-icon": { opacity: 0.4 },
                        "&.Mui-active .MuiTableSortLabel-icon": {
                          opacity: 1,
                          color: colors.brand[500],
                        },
                        "&.Mui-active": { color: colors.brand[500] },
                        "&:hover": { color: colors.neutral[800] },
                      }}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* ── Body ─────────────────────────────────────────────────── */}
          <TableBody>
            {/* Loading skeletons */}
            {loading &&
              Array.from({ length: skeletonRows }, (_, i) => (
                <TableRow key={`sk-${i}`}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      <Skeleton animation="wave" height={20} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {/* Empty state */}
            {!loading && sortedRows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 6, color: colors.neutral[400] }}
                >
                  <Typography variant="body2">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            )}

            {/* Data rows */}
            {!loading &&
              sortedRows.map((row) => (
                <TableRow
                  key={row[rowKey]}
                  hover={Boolean(onRowClick)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={{
                    cursor: onRowClick ? "pointer" : "default",
                    "&:last-child td": { border: 0 },
                  }}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      align={col.align ?? "left"}
                      sx={{ whiteSpace: col.noWrap ? "nowrap" : undefined }}
                    >
                      {col.render ? col.render(row) : (row[col.key] ?? "—")}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </MuiTable>
      </TableContainer>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 3,
          }}
        >
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={(_, p) => pagination.onChange(p)}
            shape="rounded"
            color="primary"
            siblingCount={1}
            boundaryCount={1}
          />
        </Box>
      )}
    </Box>
  );
}

export default Table;
