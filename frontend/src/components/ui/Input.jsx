import { forwardRef } from "react";
import {
  TextField,
  InputAdornment,
  FormControl,
  FormHelperText,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
} from "@mui/material";
import { brand, neutral, semantic } from "../../theme/tokens";

// ── Shared sx factory ─────────────────────────────────────────────────────────
function fieldSx(hasError) {
  return {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      "& fieldset": {
        borderColor: hasError ? semantic.error.base : neutral[300],
      },
      "&:hover fieldset": {
        borderColor: hasError ? semantic.error.strong : neutral[500],
      },
      "&.Mui-focused fieldset": {
        borderColor: hasError ? semantic.error.base : brand[500],
        borderWidth: "1.5px",
      },
      "&.Mui-focused": {
        boxShadow: hasError
          ? "0 0 0 3px rgba(239,68,68,0.18)"
          : "0 0 0 3px rgba(255,90,95,0.22)",
      },
    },
    "& .MuiInputLabel-root": { fontWeight: 600, fontSize: "0.875rem" },
    "& .MuiInputLabel-root.Mui-focused": {
      color: hasError ? semantic.error.base : brand[500],
    },
  };
}

const helperSx = (hasError) => ({
  sx: {
    fontSize: "0.8125rem",
    fontWeight: hasError ? 500 : 400,
    color: hasError ? semantic.error.text : neutral[500],
  },
});

/**
 * Input — single-line text field
 */
export const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    required,
    type = "text",
    startAdornment,
    endAdornment,
    sx,
    ...props
  },
  ref,
) {
  return (
    <TextField
      inputRef={ref}
      label={label}
      required={required}
      error={Boolean(error)}
      helperText={error || hint}
      type={type}
      variant="outlined"
      fullWidth
      FormHelperTextProps={helperSx(Boolean(error))}
      InputProps={{
        startAdornment: startAdornment ? (
          <InputAdornment position="start">{startAdornment}</InputAdornment>
        ) : undefined,
        endAdornment: endAdornment ? (
          <InputAdornment position="end">{endAdornment}</InputAdornment>
        ) : undefined,
      }}
      sx={{ ...fieldSx(Boolean(error)), ...sx }}
      {...props}
    />
  );
});

/**
 * Textarea — multiline text field
 */
export const Textarea = forwardRef(function Textarea(
  { label, error, hint, required, rows = 4, sx, ...props },
  ref,
) {
  return (
    <TextField
      inputRef={ref}
      label={label}
      required={required}
      error={Boolean(error)}
      helperText={error || hint}
      variant="outlined"
      fullWidth
      multiline
      rows={rows}
      FormHelperTextProps={helperSx(Boolean(error))}
      sx={{ ...fieldSx(Boolean(error)), ...sx }}
      {...props}
    />
  );
});

/**
 * Select — dropdown field
 */
export const Select = forwardRef(function Select(
  {
    label,
    error,
    hint,
    required,
    options = [],
    placeholder = "Select…",
    value,
    onChange,
    sx,
    ...props
  },
  ref,
) {
  const hasError = Boolean(error);
  const labelId = label
    ? `${label.toLowerCase().replace(/\s+/g, "-")}-label`
    : undefined;

  return (
    <FormControl fullWidth error={hasError} required={required}>
      {label && (
        <InputLabel
          id={labelId}
          sx={{
            fontWeight: 600,
            fontSize: "0.875rem",
            "&.Mui-focused": {
              color: hasError ? semantic.error.base : brand[500],
            },
          }}
        >
          {label}
        </InputLabel>
      )}
      <MuiSelect
        inputRef={ref}
        labelId={labelId}
        label={label}
        value={value}
        onChange={onChange}
        displayEmpty={Boolean(placeholder)}
        sx={{
          borderRadius: "12px",
          fontSize: "0.9375rem",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: hasError ? semantic.error.base : neutral[300],
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: hasError ? semantic.error.strong : neutral[500],
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: hasError ? semantic.error.base : brand[500],
            borderWidth: "1.5px",
          },
          "&.Mui-focused": {
            boxShadow: hasError
              ? "0 0 0 3px rgba(239,68,68,0.18)"
              : "0 0 0 3px rgba(255,90,95,0.22)",
          },
          ...sx,
        }}
        {...props}
      >
        {placeholder && (
          <MenuItem value="" disabled sx={{ color: neutral[400] }}>
            {placeholder}
          </MenuItem>
        )}
        {options.map((opt) => {
          const val = typeof opt === "string" ? opt : opt.value;
          const label = typeof opt === "string" ? opt : opt.label;
          return (
            <MenuItem key={val} value={val}>
              {label}
            </MenuItem>
          );
        })}
      </MuiSelect>
      {(error || hint) && (
        <FormHelperText sx={helperSx(hasError).sx}>
          {error || hint}
        </FormHelperText>
      )}
    </FormControl>
  );
});

/**
 * SearchInput — pill-shaped search field
 */
export const SearchInput = forwardRef(function SearchInput(
  { value, onChange, placeholder = "Search…", sx, startAdornment, ...props },
  ref,
) {
  return (
    <TextField
      inputRef={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      variant="outlined"
      size="small"
      type="search"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            {startAdornment ?? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={neutral[400]}
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            )}
          </InputAdornment>
        ),
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "9999px",
          backgroundColor: neutral[50],
          "& fieldset": { borderColor: neutral[200] },
          "&:hover fieldset": { borderColor: neutral[400] },
          "&.Mui-focused fieldset": {
            borderColor: brand[500],
            borderWidth: "1.5px",
          },
          "&.Mui-focused": {
            boxShadow: "0 0 0 3px rgba(255,90,95,0.22)",
            backgroundColor: neutral[0],
          },
        },
        "& .MuiOutlinedInput-input": {
          padding: "9px 14px 9px 0",
          fontSize: "0.875rem",
        },
        ...sx,
      }}
      {...props}
    />
  );
});

export default Input;
