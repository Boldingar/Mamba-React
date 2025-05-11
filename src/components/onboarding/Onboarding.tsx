import React, { useState } from "react";
import { Stepper, Step, StepLabel, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import WebsiteForm from "./WebsiteForm";
import Products from "./Products";
import Personas from "./Personas";
import Competitors from "./Competitors";
import Success from "./Success";
import LoadingTransition from "./LoadingTransition";
import axios from "../../utils/axios";

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
}

const steps = ["Website", "Products", "Personas", "Competitors", "Success"];

interface OnboardingProps {
  activeStep: number;
  setActiveStep: (step: number) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({
  activeStep,
  setActiveStep,
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    website_url: "",
    target_market: "USA",
    products: [],
    personas: [],
    competitors: [],
    company_summary: "",
  });

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
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
        },
      });

      // Redirect to chat page after successful submission
      navigate("/chat");
    } catch (error) {
      console.error("Error creating project:", error);
      // Handle error (you might want to show an error message to the user)
    }
  };

  const handleWebsiteAnalysis = () => {
    setIsLoading(true);
  };

  const handleAnalysisComplete = () => {
    // Let the loading transition complete naturally
    setTimeout(() => {
      setIsLoading(false);
      setActiveStep(activeStep + 1);
    }, 1000);
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
          />
        );
      case 1:
        return (
          <Products
            formData={formData}
            setFormData={setFormData}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <Personas
            formData={formData}
            setFormData={setFormData}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case 3:
        return (
          <Competitors
            formData={formData}
            setFormData={setFormData}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case 4:
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
      }}
    >
      <Stepper
        activeStep={activeStep}
        sx={{
          mb: 4,
          "& .MuiStepLabel-label": {
            color: "text.primary",
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
          <LoadingTransition isLoading={isLoading} onComplete={() => {}} />
        ) : (
          getStepContent(activeStep)
        )}
      </Box>
    </Box>
  );
};

export default Onboarding;
