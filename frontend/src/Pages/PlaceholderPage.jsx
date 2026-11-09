import { Box, Typography } from "@mui/material";
export default function PlaceholderPage({ title }) {
  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={800}>
        {title}
      </Typography>
      <Typography color="text.secondary" mt={2}>
        This screen is part of the original navigation, but has no implemented
        feed in the source project.
      </Typography>
    </Box>
  );
}
