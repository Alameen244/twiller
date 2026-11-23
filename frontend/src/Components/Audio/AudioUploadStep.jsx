import { Box, LinearProgress, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Button } from "../UI";

export default function AudioUploadStep({ progress, onCancel }) {
  const { t } = useTranslation();
  const processing = progress >= 100;

  return (
    <Box>
      <Typography sx={{ fontSize: 24, fontWeight: 800, mb: 1 }}>
        {processing ? t("audio.processingTitle") : t("audio.uploadingTitle")}
      </Typography>
      <Typography sx={{ fontSize: 14, color: "#71767b", mb: 3, lineHeight: 1.5 }}>
        {processing
          ? t("audio.processingDesc")
          : t("audio.uploadingDesc")}
      </Typography>

      <LinearProgress
        variant={processing ? "indeterminate" : "determinate"}
        value={progress}
        sx={{
          height: 8,
          borderRadius: 99,
          bgcolor: "#333639",
          "& .MuiLinearProgress-bar": { bgcolor: "#1d9bf0", borderRadius: 99 },
        }}
      />

      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
        <Typography sx={{ fontSize: 13, color: "#71767b" }}>
          {processing ? t("audio.processing") : t("audio.uploading")}
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#71767b", fontVariantNumeric: "tabular-nums" }}>
          {progress}%
        </Typography>
      </Stack>

      {!processing && (
        <Stack alignItems="center" sx={{ mt: 3 }}>
          <Button onClick={onCancel} sx={{ color: "#f4212e", fontWeight: 700, bgcolor: "transparent" }}>
            {t("audio.cancelUpload")}
          </Button>
        </Stack>
      )}
    </Box>
  );
}
