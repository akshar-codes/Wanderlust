import { createContext, useContext } from "react";

export const ColorModeContext = createContext(null);

export function useColorModeContext() {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error(
      "useColorModeContext must be used within a ColorModeProvider",
    );
  }
  return context;
}
