import { useEffect, useState } from "react";
import { Box, List } from "@mui/material";
import { History, Logout, PersonOutline, Translate, WorkspacePremium } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../Context/AuthContext";
import { getMySubscriptionApi } from "../Apis/subscriptionApi";
import { SUPPORTED_LANGUAGES } from "../i18n";
import LogoutDialog from "../Components/LogoutDialog";
import SettingsHeader from "../Components/Settings/SettingsHeader";
import SettingsMenuItem from "../Components/Settings/SettingsMenuItem";
import LanguageDialog from "../Components/Settings/LanguageDialog";

const premiumDescription = (sub, t) => {
  if (!sub) return t("settings.premiumDescDefault");
  if (sub.tweetLimit === null) {
    return t("settings.premiumDescUnlimited", {
      plan: sub.planName,
      used: sub.tweetsUsed,
    });
  }
  return t("settings.premiumDescLimited", {
    plan: sub.planName,
    used: Math.min(sub.tweetsUsed, sub.tweetLimit),
    limit: sub.tweetLimit,
  });
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [subscription, setSubscription] = useState(null);

  const currentLanguage = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language);

  useEffect(() => {
    getMySubscriptionApi()
      .then(setSubscription)
      .catch(() => {}); // keep the default description if it fails
  }, []);

  return (
    <Box>
      <SettingsHeader title={t("settings.title")} />
      <List disablePadding>
        <SettingsMenuItem
          icon={PersonOutline}
          label={t("settings.yourAccount")}
          description={t("settings.yourAccountDesc")}
          onClick={() => navigate("/settings/account")}
        />
        <SettingsMenuItem
          icon={History}
          label={t("settings.loginHistory")}
          description={t("settings.loginHistoryDesc")}
          onClick={() => navigate("/settings/login-history")}
        />
        <SettingsMenuItem
          icon={Translate}
          label={t("language.title")}
          description={currentLanguage?.nativeName}
          onClick={() => setLanguageOpen(true)}
        />
        <SettingsMenuItem
          icon={WorkspacePremium}
          label={t("settings.premium")}
          description={premiumDescription(subscription, t)}
          onClick={() => navigate("/plans")}
        />
        <SettingsMenuItem
          icon={Logout}
          label={t("settings.logout")}
          description={t("settings.logoutDesc")}
          onClick={() => setLogoutOpen(true)}
        />
      </List>
      <LanguageDialog open={languageOpen} onClose={() => setLanguageOpen(false)} />
      <LogoutDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={logout}
      />
    </Box>
  );
}
