import React, { useEffect } from "react";
import { Box, useTheme } from "@mui/material";
import GoogleContext from "./GoogleContext";
import GoogleIntegrations from "./GoogleIntegrations";
import { useNavigate, useLocation } from "react-router-dom";

const Integrations: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for redirect from Google OAuth
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const googleAuthStatus = queryParams.get("google_auth_status");

    // If we're redirected from Google OAuth with a success status, navigate to chat
    if (googleAuthStatus === "success") {
      // We'll keep the URL parameters so GoogleIntegrations can process them
      navigate("/chat" + location.search);
    }
  }, [location, navigate]);

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        bgcolor: theme.palette.background.default,
        display: "flex",
        overflow: "hidden",
      }}
    >
      {/* Left Side - Context */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 4 },
        }}
      >
        <GoogleContext />
      </Box>

      {/* Right Side - Integration Buttons */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 4 },
        }}
      >
        <GoogleIntegrations />
      </Box>
    </Box>
  );
};

export default Integrations;
