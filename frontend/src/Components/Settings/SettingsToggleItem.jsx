import { ListItemButton, ListItemIcon, ListItemText, Switch } from "@mui/material";

export default function SettingsToggleItem({
  icon: Icon,
  label,
  description,
  checked,
  disabled,
  onChange,
}) {
  return (
    <ListItemButton
      onClick={onChange}
      disabled={disabled}
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
      {/* The row handles the click; the switch only shows the state. */}
      <Switch
        edge="end"
        checked={checked}
        disabled={disabled}
        onChange={() => {}}
        tabIndex={-1}
        inputProps={{ "aria-label": label }}
      />
    </ListItemButton>
  );
}
