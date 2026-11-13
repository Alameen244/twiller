import { Box, IconButton, Typography } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

export default function SettingsHeader({ title, onBack }) {
  return (
    <Box
      sx={{
        position: "sticky", top: 0, zIndex: 1, height: 53, px: 2,
        display: "flex", alignItems: "center", gap: 2,
        bgcolor: "rgba(0,0,0,0.65)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #2f3336",
      }}
    >
      {onBack && (
        <IconButton onClick={onBack} sx={{ color: "#e7e9ea" }}>
          <ArrowBack />
        </IconButton>
      )}
      <Typography variant="h6" fontWeight={800}>{title}</Typography>
    </Box>
  );
}
