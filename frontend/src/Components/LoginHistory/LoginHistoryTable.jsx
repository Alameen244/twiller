import { useEffect, useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { getLoginHistoryApi } from "../../Apis/authApi";

const STATUS_STYLES = {
  success: { label: "Success", color: "#00ba7c" },
  pending: { label: "Not verified", color: "#ffd400" },
  blocked: { label: "Blocked", color: "#f4212e" },
};

const DEVICE_LABELS = { desktop: "Desktop", laptop: "Laptop", mobile: "Mobile" };

// Shown in IST, the same timezone the mobile login window uses.
const formatTime = (value) =>
  new Date(value).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

const cellSx = { color: "#e7e9ea", borderColor: "#2f3336", whiteSpace: "nowrap" };
const headSx = { ...cellSx, color: "#71767b", fontWeight: 700 };

export default function LoginHistoryTable() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getLoginHistoryApi()
      .then((data) => !cancelled && setRows(data))
      .catch(() => !cancelled && setError("Could not load your login history."));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box sx={{ p: 2, borderTop: "1px solid #2f3336" }}>
      <Typography variant="h6" fontWeight={700} sx={{ color: "#e7e9ea" }}>
        Login history
      </Typography>
      <Typography variant="body2" sx={{ color: "#71767b", mb: 2 }}>
        Recent sign-ins to your account. Only you can see this.
      </Typography>

      {error && <Typography color="error">{error}</Typography>}
      {!rows && !error && <CircularProgress size={24} />}
      {rows?.length === 0 && (
        <Typography sx={{ color: "#71767b" }}>No logins recorded yet.</Typography>
      )}

      {rows?.length > 0 && (
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={headSx}>Date &amp; time (IST)</TableCell>
                <TableCell sx={headSx}>Browser</TableCell>
                <TableCell sx={headSx}>OS</TableCell>
                <TableCell sx={headSx}>Device</TableCell>
                <TableCell sx={headSx}>IP address</TableCell>
                <TableCell sx={headSx}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const status = STATUS_STYLES[row.status] || STATUS_STYLES.success;
                return (
                  <TableRow key={row._id}>
                    <TableCell sx={cellSx}>{formatTime(row.createdAt)}</TableCell>
                    <TableCell sx={cellSx}>{row.browser}</TableCell>
                    <TableCell sx={cellSx}>{row.os}</TableCell>
                    <TableCell sx={cellSx}>{DEVICE_LABELS[row.deviceType] || row.deviceType}</TableCell>
                    <TableCell sx={cellSx}>{row.ip}</TableCell>
                    <TableCell sx={cellSx}>
                      <Chip
                        label={status.label}
                        size="small"
                        sx={{ color: status.color, border: `1px solid ${status.color}`, bgcolor: "transparent" }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
