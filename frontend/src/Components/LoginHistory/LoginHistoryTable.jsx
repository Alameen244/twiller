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
import { useTranslation } from "react-i18next";
import { getLoginHistoryApi } from "../../Apis/authApi";

// Shown in IST, the same timezone the mobile login window uses.
const formatTime = (value, lang = "en-IN") =>
  new Date(value).toLocaleString(lang || "en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

const cellSx = { color: "#e7e9ea", borderColor: "#2f3336", whiteSpace: "nowrap" };
const headSx = { ...cellSx, color: "#71767b", fontWeight: 700 };

export default function LoginHistoryTable() {
  const { t, i18n } = useTranslation();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");

  const STATUS_STYLES = {
    success: { label: t("loginHistory.statusSuccess"), color: "#00ba7c" },
    pending: { label: t("loginHistory.statusPending"), color: "#ffd400" },
    blocked: { label: t("loginHistory.statusBlocked"), color: "#f4212e" },
  };

  const getDeviceLabel = (type) => {
    if (type === "desktop") return t("loginHistory.deviceDesktop");
    if (type === "laptop") return t("loginHistory.deviceLaptop");
    if (type === "mobile") return t("loginHistory.deviceMobile");
    return type;
  };

  useEffect(() => {
    let cancelled = false;
    getLoginHistoryApi()
      .then((data) => !cancelled && setRows(data))
      .catch(() => !cancelled && setError(t("loginHistory.couldNotLoad")));
    return () => {
      cancelled = true;
    };
  }, [t]);

  return (
    <Box sx={{ p: 2, borderTop: "1px solid #2f3336" }}>
      <Typography variant="h6" fontWeight={700} sx={{ color: "#e7e9ea" }}>
        {t("loginHistory.title")}
      </Typography>
      <Typography variant="body2" sx={{ color: "#71767b", mb: 2 }}>
        {t("loginHistory.description")}
      </Typography>

      {error && <Typography color="error">{error}</Typography>}
      {!rows && !error && <CircularProgress size={24} />}
      {rows?.length === 0 && (
        <Typography sx={{ color: "#71767b" }}>{t("loginHistory.noLogins")}</Typography>
      )}

      {rows?.length > 0 && (
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={headSx}>{t("loginHistory.dateTimeIst")}</TableCell>
                <TableCell sx={headSx}>{t("loginHistory.browser")}</TableCell>
                <TableCell sx={headSx}>{t("loginHistory.os")}</TableCell>
                <TableCell sx={headSx}>{t("loginHistory.device")}</TableCell>
                <TableCell sx={headSx}>{t("loginHistory.ip")}</TableCell>
                <TableCell sx={headSx}>{t("loginHistory.status")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const status = STATUS_STYLES[row.status] || STATUS_STYLES.success;
                return (
                  <TableRow key={row._id}>
                    <TableCell sx={cellSx}>{formatTime(row.createdAt, i18n.language)}</TableCell>
                    <TableCell sx={cellSx}>{row.browser}</TableCell>
                    <TableCell sx={cellSx}>{row.os}</TableCell>
                    <TableCell sx={cellSx}>{getDeviceLabel(row.deviceType)}</TableCell>
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
