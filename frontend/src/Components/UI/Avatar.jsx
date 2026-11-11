import { Avatar as MuiAvatar } from "@mui/material";

/**
 * Custom Avatar component with Twiller styling
 * - Has predictable default dimensions and fallback styling
 * - Accepts sizing and border props without each caller reimplementing them
 * - Falls back to its children (usually the user's initial) when an image fails
 */
export const Avatar = ({
  src,
  alt = "",
  children,
  size = 40,
  borderColor,
  borderWidth,
  borderRadius = "50%",
  sx,
  imgProps,
  ...props
}) => {
  // Do not validate or rewrite this URL. Firebase/Google image URLs can be
  // signed or use formats that a client-side URL filter may reject. MUI will
  // show the children as its normal fallback if the browser cannot load it.
  const imageSrc = typeof src === "string" && src.trim() ? src.trim() : undefined;

  const border = borderColor
    ? `${borderWidth ?? 1}px solid ${borderColor}`
    : undefined;

  return (
    <MuiAvatar
      data-component="avatar"
      data-src-input={src || 'none'}
      data-src-valid={imageSrc || 'none'}
      src={imageSrc}
      alt={alt}
      {...props}
      // Google's avatar CDN can return a fallback image unless the request
      // omits the page referrer. Keep these as shared defaults so every
      // avatar location makes the same image request.
      imgProps={{
        crossOrigin: "anonymous",
        referrerPolicy: "no-referrer",
        ...imgProps,
      }}
      sx={{
        width: size,
        height: size,
        borderRadius,
        border,
        bgcolor: "#536471",
        ...sx
      }}
    >
      {children}
    </MuiAvatar>
  );
};
