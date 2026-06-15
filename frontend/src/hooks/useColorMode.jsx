import { useState, useEffect, useMemo, useCallback } from "react";
import { getWanderlustTheme } from "../theme";

export function useColorMode() {
  const [mode, setMode] = useState(
    () => localStorage.getItem("wl-theme") || "light",
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    localStorage.setItem("wl-theme", mode);
  }, [mode]);

  const toggle = useCallback(
    () => setMode((m) => (m === "light" ? "dark" : "light")),
    [],
  );
  const theme = useMemo(() => getWanderlustTheme(mode), [mode]);

  return { mode, theme, toggle };
}
