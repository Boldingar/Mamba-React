import React from "react";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";

const GoogleContext: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ maxWidth: 480, width: "100%" }}>
      <Typography
        variant="body1"
        sx={{
          color: "text.secondary",
          mb: 2,
          fontSize: isMobile ? 16 : 20,
        }}
      >
        Optional, but recommended.
      </Typography>

      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        color="#6366F1"
        sx={{
          fontWeight: 400,
          mb: isMobile ? 2 : 4,
          fontSize: isMobile ? "1.5rem" : "2rem",
        }}
      >
        Connect Google Search Console & Analytics
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: "text.secondary",
          mb: isMobile ? 2 : 4,
          fontWeight: 500,
          fontSize: isMobile ? "16px" : "20px",
        }}
      >
        In order for us to build the most comprehensive SEO Strategy possible,
        we need a detailed understanding of where your website currently stands.
      </Typography>

      {/* <Typography variant="body1" sx={{ color: "text.secondary" }}>
        Not to worry, we'll use SEMRUSH & Ahrefs to get close approximate data.
      </Typography> */}
    </Box>
  );
};

export default GoogleContext;
