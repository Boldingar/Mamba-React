import React from "react";
import { Box, Stack } from "@mui/material";
import Onboarding from "../components/onboarding/Onboarding";
import WelcomeSection from "../components/Onboarding/WelcomeSection";
import { ThemeProvider } from "../context/ThemeContext";

const stepWelcomeContent = [
  {
    title: undefined,
    subtitle: undefined,
    bigTitle: false,
  },
  {
    title: "What are we trying to sell?",
    subtitle:
      "In order to build an SEO Strategy, we need to make sure we fully understand what your business offers. Help us make sure we're on the right track!",
    bigTitle: false,
  },
  {
    title: "Who are we selling to?",
    subtitle:
      "In order to build an SEO Strategy, we need to make sure we fully understand what your business offers. Help us make sure we're on the right track!",
    bigTitle: false,
  },
  {
    title: "Our closest competitors?",
    subtitle:
      "In order to build an SEO Strategy, we need to make sure we fully understand what your business offers. Help us make sure we're on the right track!",
    bigTitle: false,
  },
  {
    title: "You are all set 😁",
    bigTitle: true,
  },
];

const NewProject: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  // We'll pass setActiveStep to Onboarding so it can update the step
  return (
    <ThemeProvider>
      <Box
        sx={{
          minHeight: "90vh", // Account for AppBar height
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          margin: "0 auto",
          marginTop: "20px",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          sx={{ width: "100%", height: "100%" }}
        >
          {/* Left Column - Welcome Text */}
          <Box
            sx={{
              width: { xs: "100%", md: "40%" },
              height: "100%",
              display: { xs: "none", md: "block" }, // Hide on mobile
            }}
          >
            <WelcomeSection {...stepWelcomeContent[activeStep]} />
          </Box>

          {/* Right Column - Onboarding Form */}
          <Box
            sx={{
              width: { xs: "100%", md: "60%" },
              height: "70%",
              overflow: "auto",
            }}
          >
            <Onboarding activeStep={activeStep} setActiveStep={setActiveStep} />
          </Box>
        </Stack>
      </Box>
    </ThemeProvider>
  );
};

export default NewProject;
