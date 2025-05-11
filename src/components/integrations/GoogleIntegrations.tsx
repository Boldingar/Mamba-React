import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import axiosInstance from "../../utils/axios";

const GoogleIntegrations: React.FC = () => {
  const handleGoogleAnalytics = async () => {
    try {
      // Make a GET request to our backend OAuth endpoint
      const response = await axiosInstance.get("/api/google/oauth/authorize", {
        params: {
          product: "ga4",
          redirect_uri: "https://mamba.genta.agency/oauth/callback", // Must match Google Cloud Console
        },
      });

      // The backend will return the Google OAuth URL, redirect to it
      if (response.data?.authUrl) {
        window.location.href = response.data.authUrl;
      }
    } catch (error) {
      console.error("Error initiating Google Analytics OAuth:", error);
    }
  };

  const handleSearchConsole = async () => {
    try {
      // Make a GET request to our backend OAuth endpoint
      const response = await axiosInstance.get("/api/google/oauth/authorize", {
        params: {
          product: "search_console",
          redirect_uri: "https://mamba.genta.agency/oauth/callback", // Must match Google Cloud Console
        },
      });

      // The backend will return the Google OAuth URL, redirect to it
      if (response.data?.authUrl) {
        window.location.href = response.data.authUrl;
      }
    } catch (error) {
      console.error("Error initiating Search Console OAuth:", error);
    }
  };

  return (
    <Box sx={{ maxWidth: 480, width: "100%" }}>
      <Stack spacing={4}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleSearchConsole}
          sx={{
            bgcolor: "#6366F1",
            color: "white",
            p: 3,
            borderRadius: 2,
            minHeight: 70,
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 600,
            "&:hover": {
              bgcolor: alpha("#6366F1", 0.9),
            },
          }}
        >
          <Typography
            variant="body1"
            sx={{ fontWeight: 400, fontSize: "1rem" }}
          >
            Quick Start
          </Typography>
          <Box component="span" sx={{ flexGrow: 1 }} />
          Google Search Console
        </Button>

        <Button
          variant="contained"
          fullWidth
          onClick={handleGoogleAnalytics}
          sx={{
            bgcolor: "#6366F1",
            color: "white",
            p: 3,
            borderRadius: 2,
            textTransform: "none",
            fontSize: "1rem",
            minHeight: 70,
            fontWeight: 600,
            "&:hover": {
              bgcolor: alpha("#6366F1", 0.9),
            },
          }}
        >
          <Typography
            variant="body1"
            sx={{ fontWeight: 400, fontSize: "1rem" }}
          >
            Quick Start
          </Typography>
          <Box component="span" sx={{ flexGrow: 1 }} />
          Google Analytics (GA4)
        </Button>
      </Stack>
    </Box>
  );
};

export default GoogleIntegrations;
