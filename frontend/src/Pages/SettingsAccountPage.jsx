import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import SettingsHeader from "../Components/Settings/SettingsHeader";
import AccountInfo from "../Components/Settings/AccountInfo";

export default function SettingsAccountPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <Box>
      <SettingsHeader title="Your account" onBack={() => navigate("/settings")} />
      <AccountInfo user={user} />
    </Box>
  );
}
