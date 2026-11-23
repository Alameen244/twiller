import { IconButton, Stack, Typography } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import TwitterLogo from "../TwitterLogo";

export default function PlansHeader({ onClose }) {
  const { t } = useTranslation();
  return (
    <>
      <IconButton
        onClick={onClose}
        aria-label="close"
        sx={{
          position: "absolute",
          top: { xs: 12, sm: 20 },
          right: { xs: 12, sm: 20 },
          color: "#71767b",
          zIndex: 10,
          "&:hover": {
            color: "#ffffff",
            bgcolor: "rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        <Close fontSize="medium" />
      </IconButton>

      <Stack
        alignItems="center"
        textAlign="center"
        spacing={1}
        sx={{ pt: 1, mb: 3 }}
      >
        <TwitterLogo size={36} />
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            fontSize: { xs: 24, sm: 30, md: 34 },
            letterSpacing: "-0.5px",
            color: "#ffffff",
            mt: 1,
          }}
        >
          {t("plans.headerTitle")}
        </Typography>
        <Typography fontSize={15} sx={{ color: "#71767b", maxWidth: 540 }}>
          {t("plans.headerDesc")}
        </Typography>
      </Stack>
    </>
  );
}
