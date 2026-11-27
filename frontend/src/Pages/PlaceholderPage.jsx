import { Box, Button, Stack, Typography } from "@mui/material";
import { AutoAwesomeOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function PlaceholderPage({ title, titleKey }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const displayTitle = titleKey ? t(titleKey) : title;

  return (
    <Box>
      <Box
        sx={{
          position: "sticky",
          top: { xs: 53, sm: 0 },
          zIndex: 2,
          height: 53,
          px: 2,
          display: "flex",
          alignItems: "center",
          bgcolor: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #2f3336",
        }}
      >
        <Typography variant="h6" fontWeight={800}>
          {displayTitle}
        </Typography>
      </Box>

      <Stack
        alignItems="center"
        textAlign="center"
        spacing={1.75}
        sx={{ px: 3, py: 8, maxWidth: 420, mx: "auto" }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            bgcolor: "rgba(29, 155, 240, 0.12)",
            color: "#1d9bf0",
            display: "grid",
            placeItems: "center",
          }}
        >
          <AutoAwesomeOutlined />
        </Box>
        <Typography variant="h6" fontWeight={800} color="#e7e9ea">
          {t("placeholder.heading", { title: displayTitle })}
        </Typography>
        <Typography color="text.secondary" fontSize={14.5} lineHeight={1.5}>
          {t("placeholder.description")}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/")}
          sx={{
            mt: 1,
            bgcolor: "#1d9bf0",
            color: "#fff",
            fontWeight: 700,
            borderRadius: 99,
            px: 3,
            textTransform: "none",
            "&:hover": { bgcolor: "#1a8cd8" },
          }}
        >
          {t("placeholder.backHome")}
        </Button>
      </Stack>
    </Box>
  );
}
