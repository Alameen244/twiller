import { Box,  Typography } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";

export default function AccountInfoRow({
  label,
  value,
  hint,
  warning = false,
  verified = false,
  action,
}) {
  return (
    <Box
      sx={{
        px: 2,
        py: 1.75,
        ...(warning
          ? {
              border: "1px solid #2161c2da",
              bgcolor: "rgba(244,33,46,0.06)",
            }
          : { borderBottom: "1px solid #2f3336" }),
      }}
    >
      <Typography fontSize={13} color="#71767b">
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Typography fontSize={16} color="#e7e9ea">
          {value}
        </Typography>
        {verified && <CheckCircle sx={{ fontSize: 18 }} />}
      </Box>
      {hint && (
        <Typography fontSize={13} color="#71767b" mt={0.5}>
          {hint}
        </Typography>
      )}
      {action && <Box sx={{
              mt:1.5,
      }} >{action}</Box>}
    </Box>
  );
}
