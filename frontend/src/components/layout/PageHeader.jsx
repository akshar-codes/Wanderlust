import { Box, Typography, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { brand, neutral, fonts } from "../../theme/tokens";

function Breadcrumbs({ items }) {
  return (
    <Stack
      direction="row"
      spacing={0.75}
      aria-label="Breadcrumb"
      sx={{ mb: 1, flexWrap: "wrap", alignItems: "center" }}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <Stack
            key={item.label}
            direction="row"
            spacing={0.75}
            sx={{ alignItems: "center" }}
          >
            {item.to && !isLast ? (
              <Typography
                component={RouterLink}
                to={item.to}
                variant="caption"
                sx={{
                  color: "var(--color-text-secondary)",
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": { color: brand[600], textDecoration: "underline" },
                }}
              >
                {item.label}
              </Typography>
            ) : (
              <Typography
                variant="caption"
                aria-current={isLast ? "page" : undefined}
                sx={{
                  color: isLast
                    ? "var(--color-text)"
                    : "var(--color-text-secondary)",
                  fontWeight: 600,
                }}
              >
                {item.label}
              </Typography>
            )}
            {!isLast && (
              <Typography
                variant="caption"
                aria-hidden="true"
                sx={{ color: "var(--color-border-strong)" }}
              >
                /
              </Typography>
            )}
          </Stack>
        );
      })}
    </Stack>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  breadcrumbs,
  actions,
  divider = true,
  align = "left",
}) {
  const isCenter = align === "center";

  return (
    <Box
      component="header"
      sx={{
        pt: { xs: 4, md: 6 },
        pb: 3,
        mb: 4,
        borderBottom: divider ? "1px solid" : "none",
        borderColor: "divider",
        textAlign: isCenter ? "center" : "left",
      }}
    >
      {breadcrumbs?.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: isCenter ? "center" : "flex-start",
          }}
        >
          <Breadcrumbs items={breadcrumbs} />
        </Box>
      )}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          alignItems: {
            xs: isCenter ? "center" : "flex-start",
            sm: isCenter ? "center" : "flex-end",
          },
          justifyContent: isCenter ? "center" : "space-between",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          {eyebrow && (
            <Typography
              variant="overline"
              sx={{ color: brand[600], display: "block", mb: 0.5 }}
            >
              {eyebrow}
            </Typography>
          )}
          {typeof title === "string" ? (
            <Typography
              component="h1"
              sx={{
                fontFamily: fonts.display,
                fontWeight: 400,
                fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
                lineHeight: 1.15,
                color: "var(--color-text)",
                letterSpacing: "-0.015em",
              }}
            >
              {title}
            </Typography>
          ) : (
            title
          )}

          {subtitle &&
            (typeof subtitle === "string" ? (
              <Typography
                variant="body2"
                sx={{
                  color: "var(--color-text-secondary)",
                  mt: 0.75,
                  maxWidth: 560,
                }}
              >
                {subtitle}
              </Typography>
            ) : (
              subtitle
            ))}
        </Box>

        {actions && (
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: "center",
              flexWrap: "wrap",
              flexShrink: 0,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            {actions}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

export default PageHeader;
