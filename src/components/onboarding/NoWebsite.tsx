import React, { useState } from "react";
import {
  Stack,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { FormDataType } from "./Onboarding";
import axios from "../../utils/axios";

interface NoWebsiteProps {
  formData: FormDataType;
  setFormData: (data: FormDataType) => void;
  onBack: () => void;
  onNext: () => void;
  setActiveStep: (step: number) => void;
  setIsLoading: (loading: boolean) => void;
}

const NoWebsite: React.FC<NoWebsiteProps> = ({
  formData,
  setFormData,
  onBack,
  onNext,
  setActiveStep,
  setIsLoading,
}) => {
  const theme = useTheme();
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.company_summary?.trim()) {
      newErrors.company_summary = "Please describe your products or offerings";
    }
    if (!formData.personas[0]?.description?.trim()) {
      newErrors.personas = "Please describe your target audience";
    }
    if (!formData.competitors[0]?.description?.trim()) {
      newErrors.competitors = "Please provide information about competitors";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Show loading indicator before API call
    onNext();

    try {
      const response = await axios.post("/project-data", {
        project_name: formData.name,
        products_description: formData.company_summary,
        personas_description: formData.personas[0]?.description,
        competitors_description: formData.competitors[0]?.description,
      });

      if (response.data) {
        setFormData({
          ...formData,
          products: response.data.products || [],
          personas:
            response.data.target_personas || response.data.personas || [],
          competitors: response.data.competitors || [],
          company_summary: response.data.company_summary || "",
        });
        setIsLoading(false);
        setActiveStep(2);
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
      setErrors({
        api: "Failed to process your information. Please try again.",
      });
      setIsLoading(false);
      onBack();
    }
  };

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <Stack spacing={4} sx={{ width: "100%" }}>
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
              mb: 3,
            }}
          >
            <MenuItem value="USA">United States 🇺🇸</MenuItem>
            <MenuItem value="UK">United Kingdom 🇬🇧</MenuItem>
            <MenuItem value="EU">European Union 🇪🇺</MenuItem>
            <MenuItem value="CA">Canada 🇨🇦</MenuItem>
            <MenuItem value="AU">Australia 🇦🇺</MenuItem>
          </Select>
        </FormControl>

        <TextField
          multiline
          rows={4}
          fullWidth
          label="What products or offerings does your business have?"
          value={formData.company_summary || ""}
          onChange={(e) =>
            setFormData({ ...formData, company_summary: e.target.value })
          }
          error={!!errors.company_summary}
          helperText={errors.company_summary}
          sx={{ mb: 3 }}
        />

        <TextField
          multiline
          rows={4}
          fullWidth
          label="What types of people buy your products?"
          value={formData.personas[0]?.description || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              personas: [
                {
                  name: "Primary Persona",
                  description: e.target.value,
                  priority: 5,
                },
              ],
            })
          }
          error={!!errors.personas}
          helperText={errors.personas}
          sx={{ mb: 3 }}
        />

        <TextField
          multiline
          rows={4}
          fullWidth
          label="Any close competitors we could take a look at?"
          value={formData.competitors[0]?.description || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              competitors: [
                {
                  name: "Primary Competitor",
                  description: e.target.value,
                },
              ],
            })
          }
          error={!!errors.competitors}
          helperText={errors.competitors}
        />

        {errors.api && (
          <Typography color="error" sx={{ textAlign: "center" }}>
            {errors.api}
          </Typography>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 3,
            pt: 3,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button
            onClick={onBack}
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: "text.primary",
              },
            }}
          >
            Back
          </Button>
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
            Keep Moving →
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default NoWebsite;
