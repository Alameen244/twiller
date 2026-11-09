import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#1d9bf0" },
    background: { default: "#000", paper: "#000" },
    text: { primary: "#f7f9f9", secondary: "#71767b" },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: 15,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButtonBase: { defaultProps: { disableRipple: true } },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontSize: "15px",
          letterSpacing: "normal",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: { letterSpacing: "normal" },
      },
    },
  },
});
