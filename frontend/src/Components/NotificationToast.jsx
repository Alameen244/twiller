import { Box, Stack, Typography } from "@mui/material";
import { NotificationsActive } from "@mui/icons-material";

export default function NotificationToast({ title, body }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ width: "100%", pr: 1 }}>
      <Box
        sx={{
          mt: 0.25,
          width: 32,
          height: 32,
          borderRadius: "50%",
          bgcolor: "rgba(29, 155, 240, 0.14)",
          color: "#1d9bf0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <NotificationsActive sx={{ fontSize: 18 }} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography fontWeight={700} fontSize={14} color="#f7f9f9" lineHeight={1.3}>
          {title}
        </Typography>
        {body && (
          <Typography
            fontSize={13.5}
            color="#cfd4d8"
            lineHeight={1.45}
            sx={{
              mt: 0.5,
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
            }}
          >
            {body}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
