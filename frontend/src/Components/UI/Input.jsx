import { TextField } from "@mui/material";

/**
 * Custom Input component with Twiller dark theme styling
 * - White text color
 * - Gray placeholder text
 * - Gray border with hover effect
 * - Blue border on focus
 * - Full width by default
 */
export const Input = ({ sx, ...props }) => (
  <TextField
    fullWidth
    variant="outlined"
    {...props}
    slotProps={{
      input: {
        sx: {
          color: "#fff",
          "& input::placeholder": {
            color: "#71767b",
            opacity: 1
          },
          "& fieldset": {
            borderColor: "#536471"
          },
          "&:hover fieldset": {
            borderColor: "#71767b"
          },
          "&.Mui-focused fieldset": {
            borderColor: "#1d9bf0"
          },
          ...sx,
        },
      },
    }}
  />
);
