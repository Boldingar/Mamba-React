import React from "react";
import { Box, useTheme } from "@mui/material";
import GoogleContext from "./GoogleContext";
import GoogleIntegrations from "./GoogleIntegrations";

const Integrations: React.FC = () => {
  const theme = useTheme();

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
