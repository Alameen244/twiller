import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../Context/AuthContext";
import SettingsHeader from "../Components/Settings/SettingsHeader";
import AccountInfo from "../Components/Settings/AccountInfo";

export default function SettingsAccountInfoPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <Box>
      <SettingsHeader
        title={t("account.accountInfo")}
        onBack={() => navigate("/settings/account")}
      />
      <AccountInfo user={user} />
    </Box>
  );
}
