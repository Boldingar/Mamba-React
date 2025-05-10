import React, { createContext, useContext, useState, useEffect } from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  useColorScheme,
} from "@mui/material/styles";
import { lightTheme, darkTheme } from "../theme";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "dark",
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { mode: muiMode, setMode: setMuiMode } = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem("themeMode");
    return (savedMode as ThemeMode) || "dark";
  });

  // Sync ThemeContext mode with MUI mode
  useEffect(() => {
    if (muiMode === "system") {
      setMuiMode(mode);
    } else if (muiMode !== mode) {
      setMode(muiMode as ThemeMode);
    }
  }, [muiMode, mode, setMuiMode]);

  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    setMuiMode(newMode);
  };

  const theme = mode === "light" ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
