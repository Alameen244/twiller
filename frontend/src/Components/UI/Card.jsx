import { Paper } from "@mui/material";

/**
 * Custom Card component with Twiller dark theme styling
 * - Black background
 * - Gray border
 * - No border radius (sharp corners)
 * - No elevation/shadow
 */
export const Card = ({ sx, ...props }) => (
  <Paper
    elevation={0}
    {...props}
    sx={{
      bgcolor: "#000",
      border: "1px solid #2f3336",
      borderRadius: 0,
      ...sx,
    }}
  />
);
