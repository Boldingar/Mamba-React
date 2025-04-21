// theme.ts
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#1e1e1e",
      paper: "#2c2c2c",
    },
    text: {
      primary: "#ffffff",
    },
    primary: {
      main: "#4f9d69", // ChatGPT-ish green
    },
    secondary: {
      main: "#8ab4f8",
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
  },
});
