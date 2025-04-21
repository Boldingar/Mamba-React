import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./theme";
import ChatInterface from "./components/ChatInterface";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ChatInterface />
    </ThemeProvider>
  );
}

export default App;
