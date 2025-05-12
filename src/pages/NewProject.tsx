import React from "react";
import { Box, Stack } from "@mui/material";
import Onboarding from "../components/onboarding/Onboarding";
import WelcomeSection from "../components/onboarding/WelcomeSection";
import { ThemeProvider } from "../context/ThemeContext";
import AppTheme from "../../shared-theme/AppTheme";

const steps = [
  "Website",
  "Business Info",
  "Products",
  "Personas",
  "Competitors",
  "Success",
];

const stepWelcomeContent = [
  {
    title: undefined,
    subtitle: undefined,
    bigTitle: false,
  },
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

  // Business Info tab uses side-by-side layout, other tabs use vertical layout
  const isBusinessInfoStep = activeStep === 1;

  return (
    <AppTheme>
      <ThemeProvider>
        <Box
          sx={{
            maxHeight: "90vh", // Account for AppBar height
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            overflow: "hidden",
            margin: "0 auto",
            marginTop: "20px",
            width: "70%",
            maxWidth: "70%",
          }}
        >
          {isBusinessInfoStep ? (
            // Side-by-side layout for Business Info tab
            <Stack
              direction={{ xs: "column", md: "row" }}
              sx={{
                width: "100%",
                height: "100%",
                maxWidth: "100%",
              }}
            >
              {/* Left Column - Welcome Text */}
              <Box
                sx={{
                  width: { xs: "100%", md: "40%" },
                  height: "100%",
                  display: { xs: "none", md: "block" }, // Hide on mobile
                }}
              >
                <WelcomeSection
                  {...stepWelcomeContent[activeStep]}
                  step={steps[activeStep]}
                />
              </Box>

              {/* Right Column - Onboarding Form */}
              <Box
                sx={{
                  width: { xs: "100%", md: "60%" },
                  height: "80vh",
                  overflowY: "auto",
                  overflowX: "hidden",
                  padding: "0 20px",
                }}
              >
                <Onboarding
                  activeStep={activeStep}
                  setActiveStep={setActiveStep}
                />
              </Box>
            </Stack>
          ) : (
            // Vertical layout for all other tabs
            <>
              <Box sx={{ justifyContent: "flex-start", width: "100%" }}>
                {/* Welcome Section - At the top */}
                <Box
                  sx={{
                    width: "100%",
                    padding: "0 20px",
                    mb: 0,
                    paddingRight: "0",
                  }}
                >
                  <WelcomeSection
                    {...stepWelcomeContent[activeStep]}
                    step={steps[activeStep]}
                  />
                </Box>
              </Box>
              {/* Onboarding Form - Below the Welcome Section */}
              <Box
                sx={{
                  width: "100%",
                  padding: "0 20px",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                <Onboarding
                  activeStep={activeStep}
                  setActiveStep={setActiveStep}
                />
              </Box>
            </>
          )}
        </Box>
      </ThemeProvider>
    </AppTheme>
  );
};

export default NewProject;
