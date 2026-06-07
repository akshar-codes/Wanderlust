import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import "./styles/index.css";
import App from "./App.jsx";
import { wanderlustTheme } from "./theme";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={wanderlustTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
