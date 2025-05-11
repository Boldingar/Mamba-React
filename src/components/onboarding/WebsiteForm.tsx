import React, { useState } from "react";
import {
  Stack,
  TextField,
  Link,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import axios from "../../utils/axios";
import { FormDataType } from "./Onboarding";

interface WebsiteFormProps {
  formData: FormDataType;
  setFormData: (data: FormDataType) => void;
  onNext: () => void;
  onComplete: () => void;
  onSkipToProducts?: () => void;
}

const WebsiteForm: React.FC<WebsiteFormProps> = ({
  formData,
  setFormData,
  onNext,
  onComplete,
  onSkipToProducts,
}) => {
  const theme = useTheme();
  const [errors, setErrors] = useState({
    website_url: "",
    name: "",
  });
  const [isSkippingWebsite, setIsSkippingWebsite] = useState(false);

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    // If skipping website flow, just complete without loading
    if (isSkippingWebsite) {
      onComplete();
      return;
    }

    // Validate fields
    const newErrors = {
      website_url: "",
      name: "",
    };

    if (!formData.website_url) {
      newErrors.website_url = "Website URL is required";
    } else if (!validateUrl(formData.website_url)) {
      newErrors.website_url = "Please enter a valid URL";
    }

    if (!formData.name?.trim()) {
      newErrors.name = "Project name is required";
    }

    if (newErrors.website_url || newErrors.name) {
      setErrors(newErrors);
      return;
    }

    // Show loading indicator first
    onNext();

    try {
      const response = await axios.post("/project-data", {
        project_url: formData.website_url,
      });

      if (response.data) {
        setFormData({
          ...formData,
          products: response.data.products,
          personas: response.data.personas,
          competitors: response.data.competitors,
          company_summary: response.data.company_summary,
        });
        // Notify parent that API request is complete
        onComplete();
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
      setErrors({
        ...errors,
        website_url: "Failed to analyze website. Please try again.",
      });
      // TODO: Add a way to go back to the form in case of error
    }
  };

  const buttonStyles = {
    bgcolor: theme.palette.primary.main,
    color: "common.white",
    boxShadow: "none",
    borderRadius: 2,
    textTransform: "none",
    "&:hover": {
      bgcolor: theme.palette.primary.dark,
      color: "common.white",
    },
  };

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <Stack spacing={4} sx={{ width: "100%" }}>
        <Box>
          <TextField
            required
            fullWidth
            label="Project Name"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name}
            sx={{ mb: 3 }}
          />
          <TextField
            required
            id="website"
            name="website_url"
            label="Website URL"
            fullWidth
            variant="outlined"
            value={formData.website_url}
            onChange={(e) =>
              setFormData({ ...formData, website_url: e.target.value })
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
            error={!!errors.website_url}
            helperText={errors.website_url}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                // Validate project name
                if (!formData.name?.trim()) {
                  setErrors({
                    ...errors,
                    name: "Project name is required",
                  });
                  return;
                }
                // Initialize with empty fields for products, personas, and competitors
                setFormData({
                  ...formData,
                  products: [
                    {
                      name: "",
                      description: "",
                      url: "",
                      language: "",
                      priority: 5,
                    },
                  ],
                  personas: [
                    {
                      name: "",
                      description: "",
                      priority: 5,
                    },
                  ],
                  competitors: [
                    {
                      name: "",
                      description: "",
                    },
                  ],
                  company_summary: "",
                });
                // Directly complete without showing loading state
                onComplete();
              }}
              sx={{
                textDecoration: "none",
                color: "text.secondary",
                fontSize: "0.875rem",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              I don't have a website yet →
            </Link>
          </Box>
        </Box>
        <FormControl fullWidth variant="outlined">
          <InputLabel id="target-market-label">Target Market</InputLabel>
          <Select
            required
            labelId="target-market-label"
            id="targetMarket"
            name="target_market"
            value={formData.target_market}
            onChange={(e: SelectChangeEvent) =>
              setFormData({ ...formData, target_market: e.target.value })
            }
            label="Target Market"
            sx={{
              borderRadius: 2,
            }}
          >
            <MenuItem value="USA">United States</MenuItem>
            <MenuItem value="UK">United Kingdom</MenuItem>
            <MenuItem value="EU">European Union</MenuItem>
            <MenuItem value="CA">Canada</MenuItem>
            <MenuItem value="AU">Australia</MenuItem>
          </Select>
        </FormControl>
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
            onClick={handleSubmit}
            sx={{
              ...buttonStyles,
              px: 4,
              py: 1.5,
              fontSize: "1rem",
            }}
          >
            Get Started
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default WebsiteForm;
