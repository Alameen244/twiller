import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

export default function LogoutDialog({ open, onClose, onConfirm }) {
  const confirmLogout = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#000000",
          color: "#f7f9f9",
          border: "1px solid #1A8CD8",
          borderRadius: 0.2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 0, fontSize: 20, fontWeight: 700 }}>
        Log out of Twiller?
      </DialogTitle>
      <DialogContent sx={{ pt: "12px !important" }}>
        <Typography color="text.secondary">
          You can always log back in at any time.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1, gap: 1, flexDirection: "column" }}>
        <Button
          fullWidth
          variant="contained"
          onClick={confirmLogout}
          sx={{ bgcolor: "#1A8CD8", color: "#fff", borderRadius: 99, fontWeight: 700 }}
        >
          Log out
        </Button>
        <Button
          fullWidth
          variant="outlined"
          onClick={onClose}
          sx={{ borderColor: "#536471", color: "#f7f9f9", borderRadius: 99, fontWeight: 700 }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
