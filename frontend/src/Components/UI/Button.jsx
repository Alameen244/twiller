import { Button as MuiButton } from '@mui/material';

/**
 * Custom Button component with Twiller-specific styling
 * - Removes text transform (no uppercase)
 * - Rounded corners (pill shape)
 * - No minimum width restriction
 */
export const Button = ({ sx, ...props }) => (
  <MuiButton
    {...props}
    sx={{
      textTransform: "none",
      minWidth: 0,
      borderRadius: 999,
      ...sx,
    }}
  />
);
