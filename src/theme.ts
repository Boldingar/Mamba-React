// theme.ts
import { createTheme, responsiveFontSizes } from "@mui/material/styles";

// Define responsive breakpoints
const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },
};

const commonTheme = {
  typography: {
    fontFamily: "Roboto, sans-serif",
    // Responsive font sizes
    h1: {
      fontSize: "2.5rem",
      "@media (min-width:600px)": {
        fontSize: "3rem",
      },
      "@media (min-width:960px)": {
        fontSize: "3.5rem",
      },
    },
    h2: {
      fontSize: "2rem",
      "@media (min-width:600px)": {
        fontSize: "2.5rem",
      },
      "@media (min-width:960px)": {
        fontSize: "3rem",
      },
    },
    body1: {
      fontSize: "0.875rem",
      "@media (min-width:600px)": {
        fontSize: "1rem",
      },
    },
    button: {
      fontSize: "0.875rem",
      "@media (min-width:600px)": {
        fontSize: "0.9375rem",
      },
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": {
            width: "8px",
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(155, 155, 155, 0.5)",
            borderRadius: "10px",
            "&:hover": {
              backgroundColor: "rgba(155, 155, 155, 0.7)",
            },
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
            border: "none",
          },
        },
      },
    },
  },
  breakpoints,
};

// Create base themes
const createBaseTheme = (mode: "light" | "dark") =>
  createTheme({
    ...commonTheme,
    palette: {
      mode,
      background: {
        default: mode === "light" ? "#f5f5f5" : "#1e1e1e",
        paper: mode === "light" ? "#ffffff" : "#2c2c2c",
      },
      text: {
        primary: mode === "light" ? "#1a1a1a" : "#ffffff",
        secondary: mode === "light" ? "#666666" : "#b0b0b0",
      },
      primary: {
        main: "#4f9d69",
      },
      secondary: {
        main: "#8ab4f8",
      },
      divider:
        mode === "light" ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.12)",
    },
  });

// Apply responsive font sizes to themes
export const lightTheme = responsiveFontSizes(createBaseTheme("light"));
export const darkTheme = responsiveFontSizes(createBaseTheme("dark"));
