import React, { useState, useEffect } from "react";
import { Box, Button, Stack, Typography, Snackbar, Alert } from "@mui/material";
import { alpha } from "@mui/material/styles";
import axiosInstance from "../../utils/axios";
import { useNavigate, useLocation } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const GoogleIntegrations: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isSearchConsoleConnected, setIsSearchConsoleConnected] =
    useState(false);
  const [isGa4Connected, setIsGa4Connected] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status when component mounts or URL has google_auth_status
  useEffect(() => {
    // Check if we're being redirected back from Google OAuth
    const queryParams = new URLSearchParams(location.search);
    const authStatus = queryParams.get("google_auth_status");
    const service = queryParams.get("service");

    if (authStatus === "success" && service) {
      // Update the connection status based on which service was connected
      if (service === "search_console") {
        setIsSearchConsoleConnected(true);
        // Store in localStorage to persist between sessions
        localStorage.setItem("isSearchConsoleConnected", "true");
      } else if (service === "ga4") {
        setIsGa4Connected(true);
        localStorage.setItem("isGa4Connected", "true");
      }

      // Redirect back to chat page
      navigate("/chat");
    } else {
      // Check localStorage for previously connected services
      setIsSearchConsoleConnected(
        localStorage.getItem("isSearchConsoleConnected") === "true"
      );
      setIsGa4Connected(localStorage.getItem("isGa4Connected") === "true");
    }
  }, [location, navigate]);

  const handleGoogleAnalytics = () => {
    // If already connected, don't do anything
    if (isGa4Connected) return;

    // Create and submit a form
    const form = document.createElement("form");
    form.method = "GET";
    form.action = "/api/google/oauth/authorize";

    // Add product parameter
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "product";
    input.value = "ga4";
    form.appendChild(input);

    // Submit the form
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  const handleSearchConsole = () => {
    // If already connected, don't do anything
    if (isSearchConsoleConnected) return;

    // Create and submit a form
    const form = document.createElement("form");
    form.method = "GET";
    form.action = "/api/google/oauth/authorize";

    // Add product parameter
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "product";
    input.value = "search_console";
    form.appendChild(input);

    // Submit the form
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Box sx={{ maxWidth: 480, width: "100%" }}>
      <Stack spacing={4}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleSearchConsole}
          sx={{
            bgcolor: isSearchConsoleConnected ? "#4CAF50" : "#6366F1", // Green if connected, purple if not
            color: "white",
            p: 3,
            borderRadius: 2,
            minHeight: 70,
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 600,
            "&:hover": {
              bgcolor: isSearchConsoleConnected
                ? alpha("#4CAF50", 0.9)
                : alpha("#6366F1", 0.9),
            },
          }}
        >
          <Typography
            variant="body1"
            sx={{ fontWeight: 400, fontSize: "1rem" }}
          >
            {isSearchConsoleConnected ? (
              <>
                <CheckCircleIcon sx={{ mr: 1, fontSize: "1.2rem" }} />
                Connected
              </>
            ) : (
              "Quick Start"
            )}
          </Typography>
          <Box component="span" sx={{ flexGrow: 1 }} />
          Google Search Console
        </Button>

        <Button
          variant="contained"
          fullWidth
          onClick={handleGoogleAnalytics}
          sx={{
            bgcolor: isGa4Connected ? "#4CAF50" : "#6366F1", // Green if connected, purple if not
            color: "white",
            p: 3,
            borderRadius: 2,
            textTransform: "none",
            fontSize: "1rem",
            minHeight: 70,
            fontWeight: 600,
            "&:hover": {
              bgcolor: isGa4Connected
                ? alpha("#4CAF50", 0.9)
                : alpha("#6366F1", 0.9),
            },
          }}
        >
          <Typography
            variant="body1"
            sx={{ fontWeight: 400, fontSize: "1rem" }}
          >
            {isGa4Connected ? (
              <>
                <CheckCircleIcon sx={{ mr: 1, fontSize: "1.2rem" }} />
                Connected
              </>
            ) : (
              "Quick Start"
            )}
          </Typography>
          <Box component="span" sx={{ flexGrow: 1 }} />
          Google Analytics (GA4)
        </Button>
      </Stack>

      {/* Error notification */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GoogleIntegrations;
