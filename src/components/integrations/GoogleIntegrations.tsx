import React, { useState, useEffect } from "react";
import { Box, Button, Stack, Typography, Snackbar, Alert } from "@mui/material";
import { alpha } from "@mui/material/styles";
import axiosInstance from "../../utils/axios";
import {
  getIntegrationStatus,
  saveIntegrationStatus,
} from "../../utils/authRedirect";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const GoogleIntegrations: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchConsoleConnected, setSearchConsoleConnected] = useState(false);
  const [analyticsConnected, setAnalyticsConnected] = useState(false);

  // Check integration status on component mount
  useEffect(() => {
    console.log("GoogleIntegrations component mounted");

    // Get integration status from localStorage
    const searchConsoleStatus = getIntegrationStatus("search_console");
    const analyticsStatus = getIntegrationStatus("ga4");

    console.log("Integration status from localStorage:", {
      searchConsole: searchConsoleStatus,
      analytics: analyticsStatus,
    });

    // Update component state
    setSearchConsoleConnected(searchConsoleStatus);
    setAnalyticsConnected(analyticsStatus);

    return () => {
      console.log("GoogleIntegrations component unmounted");
    };
  }, []);

  const handleGoogleAnalytics = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling

    if (analyticsConnected) {
      // Show already connected message
      setSuccess("Already connected to Google Analytics (GA4)");
      return;
    }

    try {
      // Make a GET request to our backend OAuth endpoint
      const response = await axiosInstance.get("/api/google/oauth/authorize", {
        params: {
          product: "ga4",
          redirect_uri: "https://mamba.genta.agency/oauth2callback", // Updated to match the actual endpoint
        },
      });

      // The backend will return the Google OAuth URL, redirect to it
      if (response.data?.authUrl) {
        // Save that we're attempting to connect to GA4
        localStorage.setItem("connecting_to_ga4", "true");
        window.location.href = response.data.authUrl;
      } else {
        setError("Missing authentication URL in response");
      }
    } catch (error) {
      console.error("Error initiating Google Analytics OAuth:", error);
      setError("Failed to connect to Google Analytics");
    }
  };

  const handleSearchConsole = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling

    if (searchConsoleConnected) {
      // Show already connected message
      setSuccess("Already connected to Google Search Console");
      return;
    }

    try {
      // Make a GET request to our backend OAuth endpoint
      const response = await axiosInstance.get("/api/google/oauth/authorize", {
        params: {
          product: "search_console",
          redirect_uri: "https://mamba.genta.agency/oauth2callback", // Updated to match the actual endpoint
        },
      });

      // The backend will return the Google OAuth URL, redirect to it
      if (response.data?.authUrl) {
        // Save that we're attempting to connect to Search Console
        localStorage.setItem("connecting_to_search_console", "true");
        window.location.href = response.data.authUrl;
      } else {
        setError("Missing authentication URL in response");
      }
    } catch (error) {
      console.error("Error initiating Search Console OAuth:", error);
      setError("Failed to connect to Google Search Console");
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(null);
  };

  return (
    <Box sx={{ maxWidth: 480, width: "100%" }}>
      <Stack spacing={4}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleSearchConsole}
          sx={{
            bgcolor: searchConsoleConnected ? "#4CAF50" : "#6366F1", // Green if connected, purple if not
            color: "white",
            p: 3,
            borderRadius: 2,
            minHeight: 70,
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 600,
            "&:hover": {
              bgcolor: searchConsoleConnected
                ? alpha("#4CAF50", 0.9)
                : alpha("#6366F1", 0.9),
            },
          }}
        >
          <Typography
            variant="body1"
            sx={{ fontWeight: 400, fontSize: "1rem" }}
          >
            {searchConsoleConnected ? (
              <>
                {/* <CheckCircleIcon sx={{ mr: 1, fontSize: "1.2rem" }} /> */}
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
            bgcolor: analyticsConnected ? "#4CAF50" : "#6366F1", // Green if connected, purple if not
            color: "white",
            p: 3,
            borderRadius: 2,
            textTransform: "none",
            fontSize: "1rem",
            minHeight: 70,
            fontWeight: 600,
            "&:hover": {
              bgcolor: analyticsConnected
                ? alpha("#4CAF50", 0.9)
                : alpha("#6366F1", 0.9),
            },
          }}
        >
          <Typography
            variant="body1"
            sx={{ fontWeight: 400, fontSize: "1rem" }}
          >
            {analyticsConnected ? (
              <>
                {/* <CheckCircleIcon sx={{ mr: 1, fontSize: "1.2rem" }} /> */}
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
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{ zIndex: 9999 }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Success notification */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{ zIndex: 9999 }}
      >
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          sx={{ width: "100%" }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GoogleIntegrations;
