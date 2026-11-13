import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";

export default function SettingsMenuItem({ icon: Icon, label, description, onClick }) {
  return (
    <ListItemButton
      onClick={onClick}
      sx={{ px: 2, py: 1.75, "&:hover": { bgcolor: "rgba(255,255,255,0.03)" } }}
    >
      <ListItemIcon sx={{ minWidth: 40, color: "#e7e9ea" }}>
        <Icon />
      </ListItemIcon>
      <ListItemText
        primary={label}
        secondary={description}
        primaryTypographyProps={{ fontSize: 16, color: "#e7e9ea" }}
        secondaryTypographyProps={{ fontSize: 13, color: "#71767b" }}
      />
      <ChevronRight sx={{ color: "#71767b" }} />
    </ListItemButton>
  );
}
