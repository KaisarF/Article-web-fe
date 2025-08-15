import { useContext } from "react";
import { DarkModeContext } from "@/context/darkMode";


export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
}