import { Avatar as MuiAvatar } from "@mui/material";

/**
 * Custom Avatar component with Twiller styling
 * - Default gray background color
 * - Displays profile picture or initials
 */
export const Avatar = ({ src, alt, children, sx, ...props }) => (
  <MuiAvatar
    src={src}
    alt={alt}
    {...props}
    sx={{
      bgcolor: "#536471",
      ...sx
    }}
  >
    {children}
  </MuiAvatar>
);
