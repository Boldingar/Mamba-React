import React from "react";
import { Box, Typography } from "@mui/material";

const WelcomeSection: React.FC<{
  title?: string;
  subtitle?: string;
  bigTitle?: boolean;
}> = ({ title, subtitle, bigTitle }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        p: 6,
        height: "100%",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <Typography
        variant={bigTitle ? "h2" : "h3"}
        component="h1"
        sx={{
          fontWeight: 700,
          fontSize: bigTitle
            ? { xs: "2.5rem", md: "3rem" }
            : { xs: "2rem", md: "2.5rem" },
          lineHeight: 1.2,
        }}
      >
        {title || "Welcome to Mamba AI 👋"}
      </Typography>

      <Typography
        sx={{
          fontSize: "1.1rem",
          color: "text.primary",
          lineHeight: 1.5,
        }}
      >
        {subtitle ||
          "Let's begin the journey of building a successful SEO Program together."}
      </Typography>

      {!title && (
        <Typography
          sx={{
            fontSize: "1.1rem",
            color: "text.primary",
            lineHeight: 1.5,
          }}
        >
          To get started, we need to learn a little bit more about your website
          →
        </Typography>
      )}

      {/* <Typography
        sx={{
          color: "text.secondary",
          fontSize: "0.9rem",
          pt: 2,
        }}
      >
        ~3 Minutes.
      </Typography> */}
    </Box>
  );
};

export default WelcomeSection;
