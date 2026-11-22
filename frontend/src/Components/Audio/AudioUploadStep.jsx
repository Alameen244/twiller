import { Box, LinearProgress, Stack, Typography } from "@mui/material";
import { Button } from "../UI";

export default function AudioUploadStep({ progress, onCancel }) {
  const processing = progress >= 100;

  return (
    <Box>
      <Typography sx={{ fontSize: 24, fontWeight: 800, mb: 1 }}>
        {processing ? "Processing audio..." : "Uploading audio..."}
      </Typography>
      <Typography sx={{ fontSize: 14, color: "#71767b", mb: 3, lineHeight: 1.5 }}>
        {processing
          ? "Almost done. We are checking and saving your audio. This can take a few seconds."
          : "Please keep this window open until the upload finishes."}
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
          {processing ? "Processing" : "Uploading"}
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#71767b", fontVariantNumeric: "tabular-nums" }}>
          {progress}%
        </Typography>
      </Stack>

      {!processing && (
        <Stack alignItems="center" sx={{ mt: 3 }}>
          <Button onClick={onCancel} sx={{ color: "#f4212e", fontWeight: 700, bgcolor: "transparent" }}>
            Cancel upload
          </Button>
        </Stack>
      )}
    </Box>
  );
}
