import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "./i18n.js";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./theme.js";
import { AuthProvider } from "./Context/AuthContext.jsx";
import { NotificationProvider } from "./Context/NotificationContext.jsx";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          <ToastContainer
            position="bottom-center"
            theme="dark"
            autoClose={4000}
            hideProgressBar
            closeOnClick
            rtl={false}
            pauseOnFocusLoss={true}
            draggable={true}
            pauseOnHover={true}
            transition={Bounce}
          />
          <App />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
