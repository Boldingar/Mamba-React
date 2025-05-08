import React, { useEffect, useState } from "react";
import { CssBaseline, Box } from "@mui/material";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TopAppBar from "./components/TopAppBar";

function checkAuth() {
  const localToken = localStorage.getItem("authToken");
  const sessionToken = sessionStorage.getItem("authToken");
  return !!(localToken || sessionToken);
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuth());

  useEffect(() => {
    function handleStorageChange() {
      setIsAuthenticated(checkAuth());
    }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <ThemeProvider>
      <CssBaseline />
      <Box
        sx={{
          width: "100vw",
          height: "90vh",
          marginTop: "5vh",
          padding: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <LoginPage setIsAuthenticated={setIsAuthenticated} />
                )
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
                isAuthenticated ? (
                  <>
                    <TopAppBar
                      csvPanelOpen={false}
                      onToggleCSVPanel={() => {}}
                    />
                    <ChatPage setIsAuthenticated={setIsAuthenticated} />
                  </>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route path="/" element={<Navigate to="/chat" replace />} />
          </Routes>
        </BrowserRouter>
      </Box>
    </ThemeProvider>
  );
}

export default App;
