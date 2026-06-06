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
import { Search } from "lucide-react";
import { colors, radii } from "../../theme/tokens";

// ── Helper: shared sx for all inputs ─────────────────────────────────────────
function inputSx(error) {
  return {
    "& .MuiOutlinedInput-root": {
      borderRadius: radii.lg,
      backgroundColor: colors.neutral[0],
      "& fieldset": {
        borderColor: error ? colors.error.main : colors.neutral[200],
      },
      "&:hover fieldset": {
        borderColor: error ? colors.error.dark : colors.neutral[400],
      },
      "&.Mui-focused fieldset": {
        borderColor: error ? colors.error.main : colors.brand[500],
        borderWidth: 1.5,
      },
      "&.Mui-focused": {
        boxShadow: error
          ? `0 0 0 3px rgba(239,68,68,0.12)`
          : `0 0 0 3px rgba(254,66,77,0.12)`,
      },
    },
    "& .MuiInputLabel-root": {
      fontSize: "0.875rem",
      fontWeight: 600,
      color: colors.neutral[600],
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: error ? colors.error.main : colors.brand[500],
    },
    "& .MuiOutlinedInput-input": {
      fontSize: "0.9rem",
      padding: "12px 16px",
    },
  };
}

/**
 * Input — wraps MUI TextField for single-line text
 *
 * @param {string}  label
 * @param {string}  error   — if set, shows error state + message below
 * @param {string}  hint    — helper text shown below
 * @param {boolean} required
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
      InputProps={{
        startAdornment: startAdornment ? (
          <InputAdornment position="start">{startAdornment}</InputAdornment>
        ) : undefined,
        endAdornment: endAdornment ? (
          <InputAdornment position="end">{endAdornment}</InputAdornment>
        ) : undefined,
      }}
      FormHelperTextProps={{
        sx: {
          color: error ? colors.error.main : colors.neutral[500],
          fontSize: "0.78rem",
          fontWeight: error ? 500 : 400,
        },
      }}
      sx={{ ...inputSx(Boolean(error)), ...sx }}
      {...props}
    />
  );
});

/**
 * Textarea — wraps MUI TextField with multiline
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
      FormHelperTextProps={{
        sx: {
          color: error ? colors.error.main : colors.neutral[500],
          fontSize: "0.78rem",
          fontWeight: error ? 500 : 400,
        },
      }}
      sx={{
        ...inputSx(Boolean(error)),
        "& .MuiOutlinedInput-input": {
          // Multiline textarea — no fixed padding override, MUI handles it
        },
        ...sx,
      }}
      {...props}
    />
  );
});

/**
 * Select — MUI Select wrapped in FormControl
 *
 * @param {{ value: string, label: string }[]} options
 * @param {string} placeholder
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
  return (
    <FormControl fullWidth error={Boolean(error)} required={required}>
      {label && (
        <InputLabel
          sx={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: colors.neutral[600],
            "&.Mui-focused": {
              color: error ? colors.error.main : colors.brand[500],
            },
            "&.Mui-error": { color: colors.error.main },
          }}
        >
          {label}
        </InputLabel>
      )}
      <MuiSelect
        inputRef={ref}
        value={value}
        onChange={onChange}
        label={label}
        displayEmpty={Boolean(placeholder)}
        sx={{
          borderRadius: radii.lg,
          fontSize: "0.9rem",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: error ? colors.error.main : colors.neutral[200],
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: error ? colors.error.dark : colors.neutral[400],
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: error ? colors.error.main : colors.brand[500],
            borderWidth: 1.5,
          },
          ...sx,
        }}
        {...props}
      >
        {placeholder && (
          <MenuItem value="" disabled sx={{ color: colors.neutral[400] }}>
            {placeholder}
          </MenuItem>
        )}
        {options.map((opt) => (
          <MenuItem
            key={typeof opt === "string" ? opt : opt.value}
            value={typeof opt === "string" ? opt : opt.value}
          >
            {typeof opt === "string" ? opt : opt.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {(error || hint) && (
        <FormHelperText
          sx={{
            color: error ? colors.error.main : colors.neutral[500],
            fontSize: "0.78rem",
            fontWeight: error ? 500 : 400,
          }}
        >
          {error || hint}
        </FormHelperText>
      )}
    </FormControl>
  );
});

/**
 * SearchInput — styled search field
 */
export const SearchInput = forwardRef(function SearchInput(
  { value, onChange, placeholder = "Search…", sx, ...props },
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
            <Search size={16} style={{ color: colors.neutral[400] }} />
          </InputAdornment>
        ),
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: radii.full,
          backgroundColor: colors.neutral[50],
          "& fieldset": { borderColor: colors.neutral[200] },
          "&:hover fieldset": { borderColor: colors.neutral[400] },
          "&.Mui-focused fieldset": {
            borderColor: colors.brand[500],
            borderWidth: 1.5,
          },
          "&.Mui-focused": {
            backgroundColor: colors.neutral[0],
          },
        },
        "& .MuiOutlinedInput-input": {
          padding: "9px 14px 9px 0",
          fontSize: "0.85rem",
        },
        ...sx,
      }}
      {...props}
    />
  );
});

export default Input;
