import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./theme.js";
import { AuthProvider } from "./Context/AuthContext.jsx";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
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
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
