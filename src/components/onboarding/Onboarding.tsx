import React, { useState, useEffect } from "react";
import { Stepper, Step, StepLabel, Box, StepIcon } from "@mui/material";
import { useNavigate } from "react-router-dom";
import WebsiteForm from "./WebsiteForm";
import NoWebsite from "./NoWebsite";
import Products from "./Products";
import Personas from "./Personas";
import Competitors from "./Competitors";
import Success from "./Success";
import IntegrationsStep from "./IntegrationsStep";
import LoadingTransition from "./LoadingTransition";
import axios from "../../utils/axios";
import { useIsMobile } from "../../utils/responsive";
import { hasProjects } from "../../utils/projectUtils";

export interface Product {
  url: string;
  name: string;
  language: string;
  priority: number;
  description: string;
}

export interface Persona {
  name: string;
  description: string;
  priority: number;
}

export interface Competitor {
  name: string;
  description: string;
}

export interface FormDataType {
  name: string;
  website_url: string;
  target_market: string;
  products: Product[];
  personas: Persona[];
  competitors: Competitor[];
  company_summary: string;
  target_personas?: Persona[];
}

interface OnboardingProps {
  activeStep: number;
  setActiveStep: (step: number) => void;
  formData: FormDataType;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  hasWebsite: boolean | null;
  setHasWebsite: React.Dispatch<React.SetStateAction<boolean | null>>;
  isFirstProject?: boolean;
}

const Onboarding: React.FC<OnboardingProps> = ({
  activeStep,
  setActiveStep,
  formData,
  setFormData,
  isLoading,
  setIsLoading,
  hasWebsite,
  setHasWebsite,
  isFirstProject = true, // Default to true to be safe
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Create steps array based on whether this is the first project
  const steps = [
    "Website",
    "Business Info",
    "Products",
    "Personas",
    "Competitors",
    ...(isFirstProject ? ["Integrations"] : []),
    "Success",
  ];

  const handleNext = () => {
    // Reset scroll position
    const mainContainer = document.querySelector(".MuiBox-root");
    const scrollableContainers = document.querySelectorAll(
      '[id$="-scrollable-container"]'
    );
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
    scrollableContainers.forEach((container) => {
      (container as HTMLElement).scrollTo({ top: 0, behavior: "smooth" });
    });

    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    // Reset scroll position
    const mainContainer = document.querySelector(".MuiBox-root");
    const scrollableContainers = document.querySelectorAll(
      '[id$="-scrollable-container"]'
    );
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
    scrollableContainers.forEach((container) => {
      (container as HTMLElement).scrollTo({ top: 0, behavior: "smooth" });
    });

    setActiveStep(activeStep - 1);
  };

  const handleWebsiteAnalysis = () => {
    setHasWebsite(true);
    setIsLoading(true);
  };

  const handleNoWebsite = () => {
    setHasWebsite(false);
    setActiveStep(1); // Move to NoWebsite step
  };

  const handleAnalysisComplete = () => {
    setIsLoading(false);
    setActiveStep(2); // Go to Products step
  };

  const handleSubmit = async () => {
    try {
      await axios.post("/projects", {
        name: formData.name,
        website_url: formData.website_url,
        project_data: {
          products: formData.products,
          personas: formData.personas,
          competitors: formData.competitors,
          company_summary: formData.company_summary,
          geo_market: formData.target_market,
        },
      });

      // Redirect to chat page after successful submission
      navigate("/chat");
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <WebsiteForm
            formData={formData}
            setFormData={setFormData}
            onNext={handleWebsiteAnalysis}
            onComplete={handleAnalysisComplete}
            onNoWebsite={handleNoWebsite}
          />
        );
      case 1:
        return (
          <NoWebsite
            formData={formData}
            setFormData={setFormData}
            onBack={handleBack}
            onNext={() => {
              setIsLoading(true);
            }}
            setActiveStep={setActiveStep}
            setIsLoading={setIsLoading}
          />
        );
      case 2:
        return (
          <Products
            formData={formData}
            setFormData={setFormData}
            onBack={handleBack}
            onNext={() => {
              if (!formData.personas || !Array.isArray(formData.personas)) {
                setFormData({
                  ...formData,
                  personas: [],
                });
              }
              setActiveStep(3);
            }}
            showBackButton={hasWebsite === true}
          />
        );
      case 3:
        return (
          <Personas
            formData={formData}
            setFormData={setFormData}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case 4:
        return (
          <Competitors
            formData={formData}
            setFormData={setFormData}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case 5:
        // If isFirstProject is true, show IntegrationsStep at step 5, otherwise show Success
        return isFirstProject ? (
          <IntegrationsStep onBack={handleBack} onNext={handleNext} />
        ) : (
          <Success onBack={handleBack} onNext={handleSubmit} />
        );
      case 6:
        // Only reached if isFirstProject is true
        return <Success onBack={handleBack} onNext={handleSubmit} />;
      default:
        throw new Error("Unknown step");
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
        scrollBehavior: "smooth",
      }}
    >
      <Stepper
        activeStep={activeStep}
        sx={{
          mb: isMobile ? 2 : 4,
          mt: isMobile ? 3 : 0,
          "& .MuiStepLabel-label": {
            color: "text.primary",
            fontSize: isMobile ? "0.7rem" : "0.875rem",
            display: isMobile ? { xs: "none", sm: "block" } : "block",
          },
          "& .MuiStepIcon-root": {
            fontSize: isMobile ? "1.2rem" : "1.5rem",
          },
          "& .MuiStepper-root": {
            padding: isMobile ? 0 : "24px",
          },
        }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ flex: 1, width: "100%" }}>
        {isLoading ? (
          <LoadingTransition
            isLoading={isLoading}
            onComplete={handleAnalysisComplete}
          />
        ) : (
          getStepContent(activeStep)
        )}
      </Box>
    </Box>
  );
};

export default Onboarding;
