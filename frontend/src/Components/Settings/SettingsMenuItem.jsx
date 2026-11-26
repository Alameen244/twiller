import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";

export default function SettingsMenuItem({ icon: Icon, label, description, onClick }) {
  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        mx: 1,
        px: 2,
        py: 1.5,
        borderRadius: 2.5,
        "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
      }}
    >
      <ListItemIcon sx={{ minWidth: 42, color: "#e7e9ea" }}>
        <Icon sx={{ fontSize: 21 }} />
      </ListItemIcon>
      <ListItemText
        primary={label}
        secondary={description}
        primaryTypographyProps={{ fontSize: 15, fontWeight: 700, color: "#e7e9ea" }}
        secondaryTypographyProps={{ fontSize: 13, color: "#71767b", mt: 0.25 }}
      />
      <ChevronRight sx={{ color: "#71767b", ml: 1 }} />
    </ListItemButton>
  );
}
