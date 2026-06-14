import { Box, Typography, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { brand, neutral, fonts } from "../../theme/tokens";

function Breadcrumbs({ items }) {
  return (
    <Stack
      direction="row"
      spacing={0.75}
      alignItems="center"
      aria-label="Breadcrumb"
      sx={{ mb: 1, flexWrap: "wrap" }}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <Stack
            key={item.label}
            direction="row"
            spacing={0.75}
            alignItems="center"
          >
            {item.to && !isLast ? (
              <Typography
                component={RouterLink}
                to={item.to}
                variant="caption"
                sx={{
                  color: neutral[500],
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
                  color: isLast ? neutral[700] : neutral[500],
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
                sx={{ color: neutral[300] }}
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
        alignItems={{
          xs: isCenter ? "center" : "flex-start",
          sm: isCenter ? "center" : "flex-end",
        }}
        justifyContent={isCenter ? "center" : "space-between"}
        spacing={2}
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
              sx={{
                fontFamily: fonts.display,
                fontWeight: 400,
                fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
                lineHeight: 1.15,
                color: neutral[800],
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
                sx={{ color: neutral[500], mt: 0.75, maxWidth: 560 }}
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
            alignItems="center"
            flexWrap="wrap"
            sx={{ flexShrink: 0, width: { xs: "100%", sm: "auto" } }}
          >
            {actions}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

export default PageHeader;
