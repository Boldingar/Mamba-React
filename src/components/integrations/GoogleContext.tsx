import React, { useState, useEffect } from "react";
import { Box, Typography, Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const GoogleContext: React.FC = () => {
  const [isSearchConsoleConnected, setIsSearchConsoleConnected] =
    useState(false);
  const [isGa4Connected, setIsGa4Connected] = useState(false);

  // Check if any services are connected on component mount
  useEffect(() => {
    setIsSearchConsoleConnected(
      localStorage.getItem("isSearchConsoleConnected") === "true"
    );
    setIsGa4Connected(localStorage.getItem("isGa4Connected") === "true");
  }, []);

  return (
    <Box sx={{ maxWidth: 480, width: "100%" }}>
      <Typography
        variant="body1"
        sx={{ color: "text.secondary", mb: 2, fontSize: 20 }}
      >
        Optional, but recommended.
      </Typography>

      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        color="#6366F1"
        sx={{ fontWeight: 400, mb: 4, fontSize: "2rem" }}
      >
        Connect Google Search Console & Analytics
      </Typography>

      <Typography
        variant="body1"
        sx={{ color: "text.primary", mb: 2, fontWeight: 500, fontSize: "20px" }}
      >
        In order for us to build the most comprehensive SEO Strategy possible,
        we need a detailed understanding of where your website currently stands.
      </Typography>

      {/* Status indicators for connected services */}
      <Box sx={{ mt: 4, mb: 4 }}>
        {(isSearchConsoleConnected || isGa4Connected) && (
          <Typography
            variant="body1"
            sx={{ color: "text.primary", mb: 2, fontWeight: 500 }}
          >
            Connected Services:
          </Typography>
        )}

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {isSearchConsoleConnected && (
            <Chip
              icon={<CheckCircleIcon />}
              label="Google Search Console"
              color="success"
              sx={{ fontWeight: 500, px: 1 }}
            />
          )}

          {isGa4Connected && (
            <Chip
              icon={<CheckCircleIcon />}
              label="Google Analytics (GA4)"
              color="success"
              sx={{ fontWeight: 500, px: 1 }}
            />
          )}
        </Box>
      </Box>

      {(!isSearchConsoleConnected || !isGa4Connected) && (
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", fontStyle: "italic" }}
        >
          Not to worry, we'll use SEMRUSH & Ahrefs to get close approximate data
          for
          {!isSearchConsoleConnected && !isGa4Connected
            ? " both services"
            : !isSearchConsoleConnected
            ? " Search Console"
            : " Analytics"}
          .
        </Typography>
      )}
    </Box>
  );
};

export default GoogleContext;
