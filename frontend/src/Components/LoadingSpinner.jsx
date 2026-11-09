import { CircularProgress } from "@mui/material";
export default function LoadingSpinner({ size = 28 }) {
  return <CircularProgress size={size} sx={{ color: "#1d9bf0" }} />;
}
