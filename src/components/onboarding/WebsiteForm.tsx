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
  onNoWebsite: () => void;
}

const WebsiteForm: React.FC<WebsiteFormProps> = ({
  formData,
  setFormData,
  onNext,
  onComplete,
  onNoWebsite,
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
                onNoWebsite();
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
