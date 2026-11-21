import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SettingsHeader from "../Components/Settings/SettingsHeader";
import LoginHistoryTable from "../Components/LoginHistory/LoginHistoryTable";

export default function SettingsLoginHistoryPage() {
  const navigate = useNavigate();
  return (
    <Box>
      <SettingsHeader title="Login history" onBack={() => navigate("/settings")} />
      <LoginHistoryTable />
    </Box>
  );
}
