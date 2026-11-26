import { Box, List, Typography } from "@mui/material";
import { Password, PersonOutline } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SettingsHeader from "../Components/Settings/SettingsHeader";
import SettingsMenuItem from "../Components/Settings/SettingsMenuItem";

export default function SettingsAccountPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Box>
      <SettingsHeader title={t("account.title")} onBack={() => navigate("/settings")} />
      <Typography
        sx={{
          px: 3,
          pt: 1.75,
          pb: 1.25,
          fontSize: 13.5,
          lineHeight: 1.4,
          color: "#71767b",
        }}
      >
        {t("account.hubDescription")}
      </Typography>
      <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <SettingsMenuItem
          icon={PersonOutline}
          label={t("account.accountInfo")}
          description={t("account.accountInfoDesc")}
          onClick={() => navigate("/settings/account/information")}
        />
        <SettingsMenuItem
          icon={Password}
          label={t("account.resetPassword")}
          description={t("account.resetPasswordDesc")}
          onClick={() => navigate("/settings/account/reset-password")}
        />
      </List>
    </Box>
  );
}
