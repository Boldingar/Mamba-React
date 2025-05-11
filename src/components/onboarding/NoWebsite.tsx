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
