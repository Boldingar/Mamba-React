import React from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Box,
} from "@mui/material";
import AddressForm from "./AddressForm.tsx";
import Products from "./Products.tsx";
import Personas from "./Personas.tsx";
import Competitors from "./Competitors.tsx";
import Success from "./Success.tsx";
import WelcomeSection from "./WelcomeSection.tsx";
import { useTheme } from "@mui/material/styles";

const steps = ["Website", "Products", "Personas", "Competitors", "Success"];

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
    title: " set😁",
    subtitle: "Let's get started",
    bigTitle: true,
  },
];

function getStepContent(
  step: number,
  formData: any,
  setFormData: any,
  handleBack: () => void,
  handleNext: () => void
) {
  switch (step) {
    case 0:
      return <AddressForm formData={formData} setFormData={setFormData} />;
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
      return <Success onBack={handleBack} />;
    default:
      throw new Error("Unknown step");
  }
}

interface CheckoutProps {
  activeStep: number;
  setActiveStep: (step: number) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ activeStep, setActiveStep }) => {
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    website: "",
    targetMarket: "USA",
    projectDescription: "",
    cardName: "",
    cardNumber: "",
    expDate: "",
    cvv: "",
    // Add more fields as needed for products, personas, competitors
  });

  const theme = useTheme();

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          width: "100%",
          p: { xs: 2, md: 4 },
          flex: 1,
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
        <Box sx={{ maxWidth: 650, minWidth: 600, width: "100%", mx: "auto" }}>
          {getStepContent(
            activeStep,
            formData,
            setFormData,
            handleBack,
            handleNext
          )}
          {activeStep === 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 3,
                pt: 3,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{
                  ml: 1,
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.common.white,
                  "&:hover": {
                    bgcolor: theme.palette.primary.dark,
                    color: theme.palette.common.white,
                  },
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                Get Started
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Checkout;
