import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SettingsHeader from "../Components/Settings/SettingsHeader";
import LoginHistoryTable from "../Components/LoginHistory/LoginHistoryTable";

export default function SettingsLoginHistoryPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <Box>
      <SettingsHeader title={t("loginHistory.title")} onBack={() => navigate("/settings")} />
      <LoginHistoryTable />
    </Box>
  );
}
