import { useState } from "react";
import { Box, List } from "@mui/material";
import { Logout, PersonOutline } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import LogoutDialog from "../Components/LogoutDialog";
import SettingsHeader from "../Components/Settings/SettingsHeader";
import SettingsMenuItem from "../Components/Settings/SettingsMenuItem";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [logoutOpen, setLogoutOpen] = useState(false);

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
