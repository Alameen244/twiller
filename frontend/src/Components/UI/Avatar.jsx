import { Avatar as MuiAvatar } from "@mui/material";

/**
 * Custom Avatar component with Twiller styling
 * - Default gray background color
 * - Displays profile picture or initials
 */
export const Avatar = ({ src, alt, children, sx, ...props }) => {
  // Only use src if it's a valid HTTP URL
  const validSrc = src && src.trim() && src.startsWith('http') ? src : undefined;

  return (
    <MuiAvatar
      data-component="avatar"
      data-src-input={src || 'none'}
      data-src-valid={validSrc || 'none'}
      src={validSrc}
      alt={alt}
      {...props}
      imgProps={{
        crossOrigin: "anonymous",
        referrerPolicy: "no-referrer"
      }}
      sx={{
        bgcolor: "#536471",
        ...sx
      }}
    >
      {children}
    </MuiAvatar>
  );
};
