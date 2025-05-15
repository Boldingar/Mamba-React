import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Link,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import axiosInstance from "../../utils/axios";
import {
  getIntegrationStatus,
  saveIntegrationStatus,
} from "../../utils/authRedirect";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const GoogleIntegrations: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchConsoleConnected, setSearchConsoleConnected] = useState(false);
  const [analyticsConnected, setAnalyticsConnected] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

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

  const handleDisconnect = async (product: "search_console" | "ga4") => {
    setIsDisconnecting(true);
    try {
      // Call the revoke endpoint
      const response = await axiosInstance.post("/api/google/oauth/revoke", {
        product: product,
      });

      if (response.status === 200) {
        // Update local state
        if (product === "search_console") {
          setSearchConsoleConnected(false);
          saveIntegrationStatus("search_console", false);
          setSuccess("Successfully disconnected from Google Search Console");
        } else {
          setAnalyticsConnected(false);
          saveIntegrationStatus("ga4", false);
          setSuccess("Successfully disconnected from Google Analytics (GA4)");
        }
      } else {
        setError(
          `Failed to disconnect from ${
            product === "search_console"
              ? "Google Search Console"
              : "Google Analytics (GA4)"
          }`
        );
      }
    } catch (error) {
      console.error(`Error disconnecting from ${product}:`, error);
      setError(
        `Failed to disconnect from ${
          product === "search_console"
            ? "Google Search Console"
            : "Google Analytics (GA4)"
        }`
      );
    } finally {
      setIsDisconnecting(false);
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
      <Stack spacing={isMobile ? 2 : 4}>
        <Box>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSearchConsole}
            sx={{
              bgcolor: searchConsoleConnected ? "#4CAF50" : "#6366F1", // Green if connected, purple if not
              color: "white",
              p: isMobile ? 2 : 3,
              borderRadius: 2,
              minHeight: isMobile ? 60 : 70,
              textTransform: "none",
              fontSize: isMobile ? "0.9rem" : "1rem",
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
              sx={{ fontWeight: 400, fontSize: isMobile ? "0.9rem" : "1rem" }}
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
          {searchConsoleConnected && (
            <Box sx={{ textAlign: "right", mt: 1 }}>
              <Link
                component="button"
                variant="inherit"
                onClick={() => handleDisconnect("search_console")}
                disabled={isDisconnecting}
                sx={{
                  fontWeight: 500,
                  cursor: "pointer",
                  textDecoration: "none",
                  color: theme.palette.primary.main,
                  fontSize: isMobile ? "0.8rem" : "0.85rem",
                  "&:hover": {
                    textDecoration: "none",
                  },
                }}
              >
                Disconnect
              </Link>
            </Box>
          )}
        </Box>

        <Box>
          <Button
            variant="contained"
            fullWidth
            onClick={handleGoogleAnalytics}
            sx={{
              bgcolor: analyticsConnected ? "#4CAF50" : "#6366F1", // Green if connected, purple if not
              color: "white",
              p: isMobile ? 2 : 3,
              borderRadius: 2,
              textTransform: "none",
              fontSize: isMobile ? "0.9rem" : "1rem",
              minHeight: isMobile ? 60 : 70,
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
              sx={{ fontWeight: 400, fontSize: isMobile ? "0.9rem" : "1rem" }}
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
          {analyticsConnected && (
            <Box sx={{ textAlign: "right", mt: 1 }}>
              <Link
                component="button"
                variant="inherit"
                onClick={() => handleDisconnect("ga4")}
                disabled={isDisconnecting}
                sx={{
                  fontWeight: 500,
                  cursor: "pointer",
                  textDecoration: "none",
                  color: theme.palette.primary.main,
                  fontSize: isMobile ? "0.8rem" : "0.85rem",
                  "&:hover": {
                    textDecoration: "none",
                  },
                }}
              >
                Disconnect
              </Link>
            </Box>
          )}
        </Box>
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
