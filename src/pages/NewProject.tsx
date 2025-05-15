import React, { useState, useEffect } from "react";
import { Box, Stack } from "@mui/material";
import Onboarding from "../components/onboarding/Onboarding";
import WelcomeSection from "../components/onboarding/WelcomeSection";
import { ThemeProvider } from "../context/ThemeContext";
import AppTheme from "../../shared-theme/AppTheme";
import { FormDataType } from "../components/onboarding/Onboarding";
import { useIsMobile } from "../utils/responsive";
import { hasProjects } from "../utils/projectUtils";

const steps = [
  "Website",
  "Business Info",
  "Products",
  "Personas",
  "Competitors",
  "Integrations",
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
    title: "Boost your strategy with integrations",
    subtitle:
      "Connect your Google accounts to get advanced insights and optimization recommendations based on your actual data.",
    bigTitle: false,
  },
  {
    title: "You are all set 😁",
    bigTitle: true,
  },
];

const NewProject: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    website_url: "",
    target_market: "United States",
    products: [],
    personas: [],
    competitors: [],
    company_summary: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasWebsite, setHasWebsite] = useState<boolean | null>(null);
  const [isFirstProject, setIsFirstProject] = useState(true);
  const isBusinessInfoStep = activeStep === 1;
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkFirstProject = async () => {
      const userHasProjects = await hasProjects();
      setIsFirstProject(!userHasProjects);
    };

    checkFirstProject();
  }, []);

  return (
    <AppTheme>
      <ThemeProvider>
        <Box
          sx={{
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            overflow: "hidden",
            margin: "0 auto",
            marginTop: isMobile ? "10px" : "20px",
            width: isMobile ? "100%" : "90%",
            maxWidth: isMobile ? "100%" : "90%",
            px: isMobile ? 2 : 0,
          }}
        >
          {isBusinessInfoStep ? (
            <Stack
              direction={{ xs: "column", md: "row" }}
              sx={{
                width: "100%",
                height: "100%",
                maxWidth: "100%",
              }}
            >
              <Box
                sx={{
                  width: { xs: "100%", md: "30%" },
                  height: "100%",
                  display: { xs: "none", md: "block" },
                }}
              >
                <WelcomeSection
                  {...stepWelcomeContent[activeStep]}
                  step={steps[activeStep]}
                />
              </Box>
              <Box
                sx={{
                  width: { xs: "100%", md: "70%" },
                  height: isMobile ? "85vh" : "90vh",
                  overflowY: "auto",
                  overflowX: "hidden",
                  padding: isMobile ? "0 5px" : "0 20px",
                }}
              >
                <Onboarding
                  activeStep={activeStep}
                  setActiveStep={setActiveStep}
                  formData={formData}
                  setFormData={setFormData}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  hasWebsite={hasWebsite}
                  setHasWebsite={setHasWebsite}
                  isFirstProject={isFirstProject}
                />
              </Box>
            </Stack>
          ) : (
            <>
              <Box sx={{ justifyContent: "flex-start", width: "100%" }}>
                <Box
                  sx={{
                    width: "100%",
                    padding: isMobile ? "0 5px" : "0 20px",
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
              <Box
                sx={{
                  width: "100%",
                  padding: isMobile ? "0 5px" : "0 20px",
                  overflowY: "auto",
                  overflowX: "hidden",
                  height: isMobile ? "80vh" : "auto",
                }}
              >
                <Onboarding
                  activeStep={activeStep}
                  setActiveStep={setActiveStep}
                  formData={formData}
                  setFormData={setFormData}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  hasWebsite={hasWebsite}
                  setHasWebsite={setHasWebsite}
                  isFirstProject={isFirstProject}
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
