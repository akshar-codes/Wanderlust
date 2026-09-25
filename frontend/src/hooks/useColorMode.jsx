import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  createContext,
  useContext,
} from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { getWanderlustTheme, injectCSSVariables } from "../theme";

const ColorModeContext = createContext(null);

export function ColorModeProvider({ children }) {
  const [mode, setMode] = useState(
    () => localStorage.getItem("wl-theme") || "light",
  );
  const [resolvedMode, setResolvedMode] = useState("light");

  // Inject CSS variables on mount
  useEffect(() => {
    injectCSSVariables();
  }, []);

  useEffect(() => {
    let activeMode = mode;

    const updateSystemMode = (e) => {
      if (mode === "system") {
        const isDark = e
          ? e.matches
          : window.matchMedia("(prefers-color-scheme: dark)").matches;
        setResolvedMode(isDark ? "dark" : "light");
      }
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    if (mode === "system") {
      updateSystemMode();
      // Listen to OS changes
      mediaQuery.addEventListener("change", updateSystemMode);
    } else {
      setResolvedMode(mode);
    }

    localStorage.setItem("wl-theme", mode);

    return () => {
      mediaQuery.removeEventListener("change", updateSystemMode);
    };
  }, [mode]);

  useEffect(() => {
    // Apply .dark class to document root
    document.documentElement.classList.toggle("dark", resolvedMode === "dark");
  }, [resolvedMode]);

  const toggle = useCallback(() => {
    setMode((prev) => {
      if (prev === "system") {
        return resolvedMode === "light" ? "dark" : "light";
      }
      return prev === "light" ? "dark" : "light";
    });
  }, [resolvedMode]);

  const muiTheme = useMemo(
    () => getWanderlustTheme(resolvedMode),
    [resolvedMode],
  );

  const value = useMemo(
    () => ({ mode, setMode, toggle, resolvedMode, muiTheme }),
    [mode, toggle, resolvedMode, muiTheme],
  );

  return (
    <ColorModeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useColorModeContext() {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error(
      "useColorModeContext must be used within a ColorModeProvider",
    );
  }
  return context;
}
