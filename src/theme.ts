// theme.ts
import { createTheme } from "@mui/material/styles";

const commonTheme = {
  typography: {
    fontFamily: "Roboto, sans-serif",
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
};

export const lightTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: "light",
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#1a1a1a",
      secondary: "#666666",
    },
    primary: {
      main: "#4f9d69",
    },
    secondary: {
      main: "#8ab4f8",
    },
    divider: "rgba(0, 0, 0, 0.12)",
  },
});

export const darkTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: "dark",
    background: {
      default: "#1e1e1e",
      paper: "#2c2c2c",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0b0b0",
    },
    primary: {
      main: "#4f9d69",
    },
    secondary: {
      main: "#8ab4f8",
    },
    divider: "rgba(255, 255, 255, 0.12)",
  },
});
