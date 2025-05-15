import React, { useEffect } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import GoogleContext from "./GoogleContext";
import GoogleIntegrations from "./GoogleIntegrations";

const Integrations: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Add debugging for integration component mount/unmount
  useEffect(() => {
    console.log("Integrations component mounted");
    return () => {
      console.log("Integrations component unmounted");
    };
  }, []);

  // Add listener for projectEditRequested and exitIntegrationsView events
  useEffect(() => {
    const handleEvents = (event: Event) => {
      console.log(`Integrations component received event: ${event.type}`);
    };

    window.addEventListener("projectEditRequested", handleEvents);
    window.addEventListener("exitIntegrationsView", handleEvents);

    return () => {
      window.removeEventListener("projectEditRequested", handleEvents);
      window.removeEventListener("exitIntegrationsView", handleEvents);
    };
  }, []);

  // Mobile view - vertical stacking
  if (isMobile) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          bgcolor: theme.palette.background.default,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
          position: "relative",
          mt: "80px",
          zIndex: 1,
          py: 4,
        }}
      >
        {/* Context Section */}
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
            mb: 2,
          }}
        >
          <GoogleContext />
        </Box>

        {/* Integration Buttons Section */}
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
          }}
        >
          <GoogleIntegrations />
        </Box>
      </Box>
    );
  }

  // Desktop view - horizontal layout (unchanged)
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        bgcolor: theme.palette.background.default,
        display: "flex",
        overflow: "hidden",
        position: "relative", 
        zIndex: 1,
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
