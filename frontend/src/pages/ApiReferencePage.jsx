import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Download, Search } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { Card } from "../components/ui/Card";
import openApiYaml from "../../../docs/openapi.yaml?raw";

const parseEndpoints = (spec) => {
  const endpoints = [];
  let path = null;
  let current = null;
  for (const line of spec.split(/\r?\n/)) {
    const pathMatch = line.match(/^  (\/[^:]+):\s*$/);
    if (pathMatch) {
      path = pathMatch[1];
      current = null;
      continue;
    }
    const methodMatch = line.match(
      /^    (get|post|put|patch|delete|options|head):\s*$/i,
    );
    if (methodMatch && path) {
      current = {
        path,
        method: methodMatch[1].toUpperCase(),
        summary: "",
        tag: "Other",
      };
      endpoints.push(current);
      continue;
    }
    if (!current) continue;
    const summaryMatch = line.match(/^      summary:\s*(.*)$/);
    if (summaryMatch)
      current.summary = summaryMatch[1].replace(/^['"]|['"]$/g, "");
    if (/^      tags:\s*$/.test(line)) current._readTag = true;
    else if (current._readTag) {
      const tagMatch = line.match(/^        -\s*(.+)$/);
      if (tagMatch) current.tag = tagMatch[1].replace(/^['"]|['"]$/g, "");
      current._readTag = false;
    }
  }
  return endpoints;
};

const ENDPOINTS = parseEndpoints(openApiYaml);
const METHOD_COLOR = {
  GET: "success",
  POST: "primary",
  PUT: "warning",
  PATCH: "warning",
  DELETE: "error",
  OPTIONS: "default",
  HEAD: "default",
};

export default function ApiReferencePage() {
  const [query, setQuery] = useState("");
  const endpoints = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return ENDPOINTS;
    return ENDPOINTS.filter(({ path, method, summary, tag }) =>
      `${path} ${method} ${summary} ${tag}`.toLowerCase().includes(needle),
    );
  }, [query]);
  const downloadYaml = () => {
    const blob = new Blob([openApiYaml], {
      type: "application/yaml;charset=utf-8",
    });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = "wanderlust-openapi.yaml";
    anchor.click();
    URL.revokeObjectURL(href);
  };

  return (
    <Box sx={{ maxWidth: 1120, mx: "auto", px: { xs: 0, sm: 1 }, pb: 8 }}>
      <PageHeader
        eyebrow="Developers"
        title="Wanderlust API"
        subtitle="Browse the documented REST endpoints or download the OpenAPI specification."
      />
      <Card
        variant="raised"
        sx={{ p: { xs: 2, sm: 3 }, mb: 2.5, borderRadius: 3 }}
      >
        <Typography sx={{ fontWeight: 700, mb: 0.75 }}>OpenAPI 3.0</Typography>
        <Typography
          variant="body2"
          sx={{ color: "var(--color-text-secondary)", lineHeight: 1.7, mb: 2 }}
        >
          The endpoint list and YAML download are generated from the
          repository’s <code>docs/openapi.yaml</code>. Most protected endpoints
          use session-cookie authentication; see the YAML for request schemas,
          permissions, and responses.
        </Typography>
        <Button
          onClick={downloadYaml}
          variant="contained"
          startIcon={<Download size={17} />}
        >
          Download OpenAPI YAML
        </Button>
      </Card>
      <TextField
        fullWidth
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Filter by path, method, tag, or summary"
        aria-label="Filter API endpoints"
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={18} />
            </InputAdornment>
          ),
        }}
      />
      <Typography
        variant="body2"
        sx={{ color: "var(--color-text-muted)", mb: 1.5 }}
      >
        {endpoints.length} endpoint{endpoints.length === 1 ? "" : "s"}
      </Typography>
      <Box sx={{ display: "grid", gap: 1 }}>
        {endpoints.map((endpoint) => (
          <Card
            key={`${endpoint.method}:${endpoint.path}`}
            variant="raised"
            sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2.5 }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "90px minmax(0,1fr) auto",
                },
                alignItems: "center",
                gap: 1.25,
              }}
            >
              <Chip
                size="small"
                label={endpoint.method}
                color={METHOD_COLOR[endpoint.method] || "default"}
                sx={{ width: "fit-content", minWidth: 68, fontWeight: 800 }}
              />
              <Typography
                component="code"
                sx={{
                  fontFamily: "monospace",
                  overflowWrap: "anywhere",
                  color: "var(--color-text)",
                }}
              >
                {endpoint.path}
              </Typography>
              <Chip
                size="small"
                variant="outlined"
                label={endpoint.tag}
                sx={{ width: "fit-content" }}
              />
            </Box>
            {endpoint.summary && (
              <Typography
                variant="body2"
                sx={{ color: "var(--color-text-secondary)", mt: 1 }}
              >
                {endpoint.summary}
              </Typography>
            )}
          </Card>
        ))}
        {endpoints.length === 0 && (
          <Typography
            sx={{
              py: 4,
              textAlign: "center",
              color: "var(--color-text-secondary)",
            }}
          >
            No API endpoints match “{query}”.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
