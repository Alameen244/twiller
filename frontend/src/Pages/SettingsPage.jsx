import { useEffect, useState } from "react";
import { Box, List } from "@mui/material";
import { History, Logout, PersonOutline, WorkspacePremium } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { getMySubscriptionApi } from "../Apis/subscriptionApi";
import LogoutDialog from "../Components/LogoutDialog";
import SettingsHeader from "../Components/Settings/SettingsHeader";
import SettingsMenuItem from "../Components/Settings/SettingsMenuItem";

const premiumDescription = (sub) => {
  if (!sub) return "Manage your subscription and upgrade your account.";
  const usage =
    sub.tweetLimit === null
      ? `${sub.tweetsUsed} tweets posted (unlimited)`
      : `${Math.min(sub.tweetsUsed, sub.tweetLimit)} of ${sub.tweetLimit} tweets used`;
  return `${sub.planName} plan · ${usage}`;
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    getMySubscriptionApi()
      .then(setSubscription)
      .catch(() => {}); // keep the default description if it fails
  }, []);

  return (
    <Box>
      <SettingsHeader title="Settings" />
      <List disablePadding>
        <SettingsMenuItem
          icon={PersonOutline}
          label="Your account"
          description="See information about your account."
          onClick={() => navigate("/settings/account")}
        />
        <SettingsMenuItem
          icon={History}
          label="Login history"
          description="See where and when your account was accessed."
          onClick={() => navigate("/settings/login-history")}
        />
        <SettingsMenuItem
          icon={WorkspacePremium}
          label="Premium"
          description={premiumDescription(subscription)}
          onClick={() => navigate("/plans")}
        />
        <SettingsMenuItem
          icon={Logout}
          label="Logout"
          description="Sign out of your account."
          onClick={() => setLogoutOpen(true)}
        />
      </List>
      <LogoutDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={logout}
      />
    </Box>
  );
}
