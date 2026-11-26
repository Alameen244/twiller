import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../Context/AuthContext";
import SettingsHeader from "../Components/Settings/SettingsHeader";
import PasswordResetFlow from "../Components/ForgotPassword/PasswordResetFlow";

export default function SettingsResetPasswordPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const verifiedDigits =
    user?.isPhoneVerified && user?.phoneNumber
      ? user.phoneNumber.replace(/\D/g, "").slice(-10)
      : "";

  return (
    <Box>
      <SettingsHeader
        title={t("account.resetPassword")}
        onBack={() => navigate("/settings/account")}
      />
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 460, mx: "auto" }}>
        <PasswordResetFlow
          initialEmail={user?.email || ""}
          initialDigits={verifiedDigits}
          lockEmail={Boolean(user?.email)}
          lockPhone={Boolean(verifiedDigits)}
          requestTitle={t("account.resetPasswordFlowTitle")}
          requestSubtitle={t("account.resetPasswordFlowDesc")}
          doneTitle={t("account.resetSuccessTitle")}
          doneDesc={t("account.resetSuccessDesc")}
          doneButtonLabel={t("account.backToAccount")}
          onDoneAction={() => navigate("/settings/account")}
        />
      </Box>
    </Box>
  );
}
