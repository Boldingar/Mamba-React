import React, { useState, useEffect } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Box,
  CircularProgress,
  Typography,
  Button,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Container,
  FormLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import EditProducts from "./EditProducts";
import EditPersonas from "./EditPersonas";
import EditCompetitors from "./EditCompetitors";
import axios from "../../utils/axios";
import { FormDataType as BaseFormDataType } from "../onboarding/Onboarding";

// Extended interface for edit project
interface FormDataType extends BaseFormDataType {
  id?: string;
  gsc_site_url?: string | null;
}

const steps = ["Business Info", "Products", "Personas", "Competitors"];

interface EditProjectProps {
  projectId: string;
  onClose: () => void;
}

const EditProject: React.FC<EditProjectProps> = ({ projectId, onClose }) => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<FormDataType>({
    id: "",
    name: "",
    website_url: "",
    target_market: "",
    products: [],
    personas: [],
    competitors: [],
    company_summary: "",
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch project data when component mounts
  useEffect(() => {
    const fetchProjectData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/projects/${projectId}`);
        const projectData = response.data;

        setFormData({
          id: projectData.id,
          name: projectData.name,
          website_url: projectData.website_url || "",
          target_market: projectData.project_data.geo_market || "",
          products: projectData.project_data.products || [],
          personas: projectData.project_data.personas || [],
          competitors: projectData.project_data.competitors || [],
          company_summary: projectData.project_data.company_summary || "",
          gsc_site_url: projectData.gsc_site_url,
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching project data:", error);
        setError("Failed to load project data. Please try again.");
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const scrollToTop = () => {
    // Scroll to the top of the containers
    setTimeout(() => {
      const container = document.getElementById(
        "edit-project-scrollable-container"
      );
      const mainContainer = document.getElementById(
        "edit-project-main-container"
      );

      if (container) {
        container.scrollTo({ top: 0, behavior: "smooth" });
      }

      if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 100);
  };

  const handleStepClick = (step: number) => {
    // For the first step (Business Info), validate required fields before allowing navigation
    if (activeStep === 0 && !formData.target_market) {
      setValidationError(
        "Please select a target market before navigating to other steps"
      );
      return;
    }

    setValidationError(null);
    setActiveStep(step);
    scrollToTop();
  };

  const handleNext = () => {
    // For the first step (Business Info), validate required fields
    if (activeStep === 0) {
      if (!formData.target_market) {
        setValidationError("Please select a target market");
        return;
      }
      setValidationError(null);
    }

    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep(activeStep + 1);
      scrollToTop();
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
    scrollToTop();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await axios.patch(`/projects/${projectId}`, {
        name: formData.name,
        target_market: formData.target_market,
        products: formData.products,
        personas: formData.personas,
        competitors: formData.competitors,
      });

      setIsLoading(false);
      setSuccess(true);

      // Dispatch event to notify that a project has been updated
      const projectUpdatedEvent = new CustomEvent("projectUpdated", {
        detail: { projectId },
      });
      window.dispatchEvent(projectUpdatedEvent);

      // Return to chat page after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error updating project:", error);
      setError("Failed to update project. Please try again.");
      setIsLoading(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Container maxWidth="md" sx={{ p: 2 }}>
            <Box
              id="edit-project-scrollable-container"
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                maxWidth: "600px",
                margin: "0 auto",
                pb: 10, // Add bottom padding to prevent overlap with fixed buttons
              }}
            >
              {/* <Typography
                variant="h5"
                component="h2"
                sx={{ mb: 4, alignSelf: "flex-start" }}
              >
                Business Information
              </Typography> */}

              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel htmlFor="project-name">Project Name</FormLabel>
                <TextField
                  id="project-name"
                  fullWidth
                  placeholder="Enter project name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </FormControl>

              {formData.website_url && (
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <FormLabel htmlFor="website-url">Website URL</FormLabel>
                  <TextField
                    id="website-url"
                    fullWidth
                    placeholder="https://example.com"
                    value={formData.website_url}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </FormControl>
              )}

              <FormControl fullWidth required sx={{ mb: 3 }}>
                <FormLabel htmlFor="target-market">Target Market</FormLabel>
                <Select
                  id="target-market"
                  labelId="target-market-label"
                  value={formData.target_market}
                  displayEmpty
                  error={!!validationError && !formData.target_market}
                  onChange={(e: SelectChangeEvent) =>
                    setFormData({ ...formData, target_market: e.target.value })
                  }
                  sx={{
                    borderRadius: 1,
                    backgroundColor: "background.paper",
                  }}
                >
                  <MenuItem value="Algeria">Algeria</MenuItem>
                  <MenuItem value="Angola">Angola</MenuItem>
                  <MenuItem value="Azerbaijan">Azerbaijan</MenuItem>
                  <MenuItem value="Argentina">Argentina</MenuItem>
                  <MenuItem value="Australia">Australia</MenuItem>
                  <MenuItem value="Austria">Austria</MenuItem>
                  <MenuItem value="Bahrain">Bahrain</MenuItem>
                  <MenuItem value="Bangladesh">Bangladesh</MenuItem>
                  <MenuItem value="Armenia">Armenia</MenuItem>
                  <MenuItem value="Belgium">Belgium</MenuItem>
                  <MenuItem value="Bolivia">Bolivia</MenuItem>
                  <MenuItem value="Bosnia and Herzegovina">
                    Bosnia and Herzegovina
                  </MenuItem>
                  <MenuItem value="Brazil">Brazil</MenuItem>
                  <MenuItem value="Bulgaria">Bulgaria</MenuItem>
                  <MenuItem value="Myanmar (Burma)">Myanmar (Burma)</MenuItem>
                  <MenuItem value="Cambodia">Cambodia</MenuItem>
                  <MenuItem value="Cameroon">Cameroon</MenuItem>
                  <MenuItem value="Canada">Canada</MenuItem>
                  <MenuItem value="Sri Lanka">Sri Lanka</MenuItem>
                  <MenuItem value="Chile">Chile</MenuItem>
                  <MenuItem value="Taiwan">Taiwan</MenuItem>
                  <MenuItem value="Colombia">Colombia</MenuItem>
                  <MenuItem value="Costa Rica">Costa Rica</MenuItem>
                  <MenuItem value="Croatia">Croatia</MenuItem>
                  <MenuItem value="Cyprus">Cyprus</MenuItem>
                  <MenuItem value="Czechia">Czechia</MenuItem>
                  <MenuItem value="Denmark">Denmark</MenuItem>
                  <MenuItem value="Ecuador">Ecuador</MenuItem>
                  <MenuItem value="El Salvador">El Salvador</MenuItem>
                  <MenuItem value="Estonia">Estonia</MenuItem>
                  <MenuItem value="Finland">Finland</MenuItem>
                  <MenuItem value="France">France</MenuItem>
                  <MenuItem value="Germany">Germany</MenuItem>
                  <MenuItem value="Ghana">Ghana</MenuItem>
                  <MenuItem value="Greece">Greece</MenuItem>
                  <MenuItem value="Guatemala">Guatemala</MenuItem>
                  <MenuItem value="Hong Kong">Hong Kong</MenuItem>
                  <MenuItem value="Hungary">Hungary</MenuItem>
                  <MenuItem value="India">India</MenuItem>
                  <MenuItem value="Indonesia">Indonesia</MenuItem>
                  <MenuItem value="Ireland">Ireland</MenuItem>
                  <MenuItem value="Israel">Israel</MenuItem>
                  <MenuItem value="Italy">Italy</MenuItem>
                  <MenuItem value="Cote d'Ivoire">Cote d'Ivoire</MenuItem>
                  <MenuItem value="Japan">Japan</MenuItem>
                  <MenuItem value="Kazakhstan">Kazakhstan</MenuItem>
                  <MenuItem value="Jordan">Jordan</MenuItem>
                  <MenuItem value="Kenya">Kenya</MenuItem>
                  <MenuItem value="South Korea">South Korea</MenuItem>
                  <MenuItem value="Latvia">Latvia</MenuItem>
                  <MenuItem value="Lithuania">Lithuania</MenuItem>
                  <MenuItem value="Malaysia">Malaysia</MenuItem>
                  <MenuItem value="Malta">Malta</MenuItem>
                  <MenuItem value="Mexico">Mexico</MenuItem>
                  <MenuItem value="Moldova">Moldova</MenuItem>
                  <MenuItem value="Morocco">Morocco</MenuItem>
                  <MenuItem value="Netherlands">Netherlands</MenuItem>
                  <MenuItem value="New Zealand">New Zealand</MenuItem>
                  <MenuItem value="Nicaragua">Nicaragua</MenuItem>
                  <MenuItem value="Nigeria">Nigeria</MenuItem>
                  <MenuItem value="Norway">Norway</MenuItem>
                  <MenuItem value="Pakistan">Pakistan</MenuItem>
                  <MenuItem value="Panama">Panama</MenuItem>
                  <MenuItem value="Paraguay">Paraguay</MenuItem>
                  <MenuItem value="Peru">Peru</MenuItem>
                  <MenuItem value="Philippines">Philippines</MenuItem>
                  <MenuItem value="Poland">Poland</MenuItem>
                  <MenuItem value="Portugal">Portugal</MenuItem>
                  <MenuItem value="Romania">Romania</MenuItem>
                  <MenuItem value="Saudi Arabia">Saudi Arabia</MenuItem>
                  <MenuItem value="Senegal">Senegal</MenuItem>
                  <MenuItem value="Serbia">Serbia</MenuItem>
                  <MenuItem value="Singapore">Singapore</MenuItem>
                  <MenuItem value="Slovakia">Slovakia</MenuItem>
                  <MenuItem value="Vietnam">Vietnam</MenuItem>
                  <MenuItem value="Slovenia">Slovenia</MenuItem>
                  <MenuItem value="South Africa">South Africa</MenuItem>
                  <MenuItem value="Spain">Spain</MenuItem>
                  <MenuItem value="Sweden">Sweden</MenuItem>
                  <MenuItem value="Switzerland">Switzerland</MenuItem>
                  <MenuItem value="Thailand">Thailand</MenuItem>
                  <MenuItem value="United Arab Emirates">
                    United Arab Emirates
                  </MenuItem>
                  <MenuItem value="Tunisia">Tunisia</MenuItem>
                  <MenuItem value="Turkiye">Turkiye</MenuItem>
                  <MenuItem value="Ukraine">Ukraine</MenuItem>
                  <MenuItem value="North Macedonia">North Macedonia</MenuItem>
                  <MenuItem value="Egypt">Egypt</MenuItem>
                  <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                  <MenuItem value="United States">United States</MenuItem>
                  <MenuItem value="Burkina Faso">Burkina Faso</MenuItem>
                  <MenuItem value="Uruguay">Uruguay</MenuItem>
                  <MenuItem value="Venezuela">Venezuela</MenuItem>
                </Select>
              </FormControl>

              {validationError && (
                <Alert severity="error" sx={{ mb: 3, width: "100%" }}>
                  {validationError}
                </Alert>
              )}

              <Box sx={{ width: "100%", mb: 4 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Company Summary:
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  variant="outlined"
                  value={formData.company_summary}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      company_summary: e.target.value,
                    })
                  }
                  sx={{
                    borderRadius: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                    },
                    "& .MuiInputBase-root": {
                      minHeight: "180px",
                    },
                    "& .MuiOutlinedInput-input": {
                      height: "auto !important",
                    },
                    mb: 2,
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mt: 4,
                  width: "100%",
                }}
              >
                {/* <Button
                  variant="contained"
                  color="primary"
                  sx={{ px: 4 }}
                  onClick={handleNext}
                >
                  Next
                </Button> */}
              </Box>
            </Box>
          </Container>
        );
      case 1:
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              width: "100%",
              overflow: "hidden",
            }}
          >
            <Box
              id="edit-project-scrollable-container"
              sx={{
                flex: 1,
                overflow: "auto",
                width: "100%",
                height: "100%",
                pr: 4, // Reduced right padding
                pb: 10, // Add bottom padding to prevent overlap with fixed buttons
              }}
            >
              <EditProducts
                formData={formData}
                setFormData={setFormData}
                onBack={handleBack}
                onNext={handleNext}
              />
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              width: "100%",
              overflow: "hidden",
            }}
          >
            <Box
              id="edit-project-scrollable-container"
              sx={{
                flex: 1,
                overflow: "auto",
                width: "100%",
                height: "100%",
                pr: 4, // Reduced right padding
                pb: 10, // Add bottom padding to prevent overlap with fixed buttons
              }}
            >
              <EditPersonas
                formData={formData}
                setFormData={setFormData}
                onBack={handleBack}
                onNext={handleNext}
              />
            </Box>
          </Box>
        );
      case 3:
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              width: "100%",
              overflow: "hidden",
            }}
          >
            <Box
              id="edit-project-scrollable-container"
              sx={{
                flex: 1,
                overflow: "auto",
                width: "100%",
                height: "100%",
                pr: 4, // Reduced right padding
                pb: 10, // Add bottom padding to prevent overlap with fixed buttons
              }}
            >
              <EditCompetitors
                formData={formData}
                setFormData={setFormData}
                onBack={handleBack}
                onNext={handleNext}
              />
            </Box>
          </Box>
        );
      default:
        throw new Error("Unknown step");
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          backgroundColor: "background.default",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          backgroundColor: "background.default",
          height: "100%",
        }}
      >
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Button variant="contained" onClick={onClose} sx={{ mt: 2 }}>
          Return to Chat
        </Button>
      </Box>
    );
  }

  if (success) {
    return (
      <Box
        sx={{
          marginTop: "100px",
          p: 4,
          textAlign: "center",
          backgroundColor: "background.default",
          height: "100%",
        }}
      >
        <Alert severity="success" sx={{ mb: 3 }}>
          Project successfully updated!
        </Alert>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Returning to chat...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      id="edit-project-main-container"
      sx={{
        width: "80%", // Reduce width to center the component
        maxWidth: "1000px", // Set a maximum width
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        p: 2,
        backgroundColor: "transparent",
        overflow: "hidden",
        margin: "0 auto", // Center the component
        borderRadius: 1, // Fixed border radius of 1
        borderColor: "divider",
        position: "relative", // Add position relative for absolute positioning
      }}
    >
      <Stepper
        activeStep={activeStep}
        sx={{
          mb: 4,
          "& .MuiStepLabel-label": {
            color: "text.primary",
          },
          "& .MuiStepLabel-root": {
            cursor: "pointer",
          },
        }}
      >
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel onClick={() => handleStepClick(index)}>
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ flex: 1, width: "100%", overflow: "hidden" }}>
        {getStepContent(activeStep)}
      </Box>

      {/* Fixed Save/Next Button - visible on all steps */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: 2,
          backgroundColor: "background.default",
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          zIndex: 10, // Add a higher z-index to ensure it's above other elements
          boxShadow: "0px -2px 4px rgba(0,0,0,0.05)", // Add subtle shadow for visual separation
        }}
      >
        {activeStep > 0 && (
          <Button
            variant="contained"
            onClick={handleBack}
            sx={{
              px: 3,
              boxShadow: "none",
              borderRadius: 1,
              textTransform: "none",
            }}
          >
            Back
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          color="primary"
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
          sx={{
            px: 6,
            boxShadow: "none",
            borderRadius: 1,
            textTransform: "none",
          }}
        >
          {activeStep === steps.length - 1 ? "Save" : "Next"}
        </Button>
      </Box>
    </Box>
  );
};

export default EditProject;
