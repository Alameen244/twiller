import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export default function DeletePostDialog({ open, onClose, onConfirm, loading }) {
  const { t } = useTranslation();

  return (
    <Dialog
      data-component="delete-post-dialog"
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: "#000000",
            color: "#f7f9f9",
            border: "1px solid #1A8CD8",
            borderRadius: 0.2,
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 0, fontSize: 20, fontWeight: 700 }}>
        {t("delete.title")}
      </DialogTitle>
      <DialogContent sx={{ pt: "12px !important" }}>
        <Typography color="text.secondary">
          {t("delete.description")}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1, gap: 1, flexDirection: "column" }}>
        <Button
          fullWidth
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
          sx={{ bgcolor: "#f4212e", color: "#fff", borderRadius: 99, fontWeight: 700 }}
        >
          {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : t("delete.confirm")}
        </Button>
        <Button
          fullWidth
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          sx={{ borderColor: "#536471", color: "#f7f9f9", borderRadius: 99, fontWeight: 700 }}
        >
          {t("common.cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
