import { useNavigate } from "react-router-dom";
import { Box, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import TwitterLogo from "../Components/TwitterLogo";
import { Button } from "../Components/UI";
import PasswordResetFlow from "../Components/ForgotPassword/PasswordResetFlow";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#000",
        color: "#e7e9ea",
        display: "grid",
        placeItems: "center",
        p: 2,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 440 }}>
        <Stack alignItems="center" spacing={3}>
          <TwitterLogo size={40} />

          <Box sx={{ width: "100%" }}>
            <PasswordResetFlow onDoneAction={() => navigate("/")} />
          </Box>

          <Button onClick={() => navigate("/")} sx={{ color: "#1d9bf0", fontWeight: 700 }}>
            {t("forgot.backToSignIn")}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
