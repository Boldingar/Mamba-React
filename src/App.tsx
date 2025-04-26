import React, { useEffect, useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { theme } from "./theme";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TopAppBar from "./components/TopAppBar";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check both localStorage and sessionStorage for the auth token
    const localToken = localStorage.getItem("authToken");
    const sessionToken = sessionStorage.getItem("authToken");
    setIsAuthenticated(!!(localToken || sessionToken));
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TopAppBar />
      {/* Spacer to push content below the AppBar */}
      <div style={{ height: 40 }} />
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
            }
          />
          <Route
            path="/chat"
            element={
              isAuthenticated ? <ChatPage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/chat" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
