import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  MenuItem,
  IconButton,
  Typography,
  Slider,
  Paper,
  CloseIcon,
  AddIcon,
} from "./ui";
import { Alert } from "@mui/material";
import Grid from "./Grid";
import { API_BASE_URL } from "../utils/axios";

interface ProductService {
  name: string;
  url: string;
  description: string;
  target_persona: string;
  priority: number | string;
}

interface BusinessInfoFormProps {
  onClose: () => void;
  onFileClick: (data: {
    title: string;
    headers: string[];
    rows: any[][];
  }) => void;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

const locations = [
  "Algeria",
  "Angola",
  "Azerbaijan",
  "Argentina",
  "Australia",
  "Austria",
  "Bahrain",
  "Bangladesh",
  "Armenia",
  "Belgium",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Brazil",
  "Bulgaria",
  "Myanmar (Burma)",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Sri Lanka",
  "Chile",
  "Taiwan",
  "Colombia",
  "Costa Rica",
  "Croatia",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Ecuador",
  "El Salvador",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Ghana",
  "Greece",
  "Guatemala",
  "Hong Kong",
  "Hungary",
  "India",
  "Indonesia",
  "Ireland",
  "Israel",
  "Italy",
  "Cote d'Ivoire",
  "Japan",
  "Kazakhstan",
  "Jordan",
  "Kenya",
  "South Korea",
  "Latvia",
  "Lithuania",
  "Malaysia",
  "Malta",
  "Mexico",
  "Moldova",
  "Morocco",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Nigeria",
  "Norway",
  "Pakistan",
  "Panama",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Romania",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Singapore",
  "Slovakia",
  "Vietnam",
  "Slovenia",
  "South Africa",
  "Spain",
  "Sweden",
  "Switzerland",
  "Thailand",
  "United Arab Emirates",
  "Tunisia",
  "Turkiye",
  "Ukraine",
  "North Macedonia",
  "Egypt",
  "United Kingdom",
  "United States",
  "Burkina Faso",
  "Uruguay",
  "Venezuela",
];

const marketGeoOptions = [
  "Algeria",
  "Angola",
  "Azerbaijan",
  "Argentina",
  "Australia",
  "Austria",
  "Bahrain",
  "Bangladesh",
  "Armenia",
  "Belgium",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Brazil",
  "Bulgaria",
  "Myanmar (Burma)",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Sri Lanka",
  "Chile",
  "Taiwan",
  "Colombia",
  "Costa Rica",
  "Croatia",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Ecuador",
  "El Salvador",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Ghana",
  "Greece",
  "Guatemala",
  "Hong Kong",
  "Hungary",
  "India",
  "Indonesia",
  "Ireland",
  "Israel",
  "Italy",
  "Cote d'Ivoire",
  "Japan",
  "Kazakhstan",
  "Jordan",
  "Kenya",
  "South Korea",
  "Latvia",
  "Lithuania",
  "Malaysia",
  "Malta",
  "Mexico",
  "Moldova",
  "Morocco",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Nigeria",
  "Norway",
  "Pakistan",
  "Panama",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Romania",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Singapore",
  "Slovakia",
  "Vietnam",
  "Slovenia",
  "South Africa",
  "Spain",
  "Sweden",
  "Switzerland",
  "Thailand",
  "United Arab Emirates",
  "Tunisia",
  "Turkiye",
  "Ukraine",
  "North Macedonia",
  "Egypt",
  "United Kingdom",
  "United States",
  "Burkina Faso",
  "Uruguay",
  "Venezuela",
];

const BusinessInfoForm: React.FC<BusinessInfoFormProps> = ({
  onClose,
  onFileClick,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    company_name: "",
    website: "",
    niche: "",
    location: "",
    target_personas: "",
    market_geo: "",
    value_props: "",
  });

  const [productsServices, setProductsServices] = useState<ProductService[]>([
    {
      name: "",
      url: "",
      description: "",
      target_persona: "",
      priority: 5,
    },
  ]);

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error for this field when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleProductServiceChange = (
    index: number,
    field: keyof ProductService,
    value: string | number
  ) => {
    setProductsServices((prev) => {
      const newProductsServices = [...prev];
      newProductsServices[index] = {
        ...newProductsServices[index],
        [field]: value,
      };
      return newProductsServices;
    });

    // Clear validation error for this product/service field when user types
    const errorKey = `productsServices[${index}].${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const addProductService = () => {
    setProductsServices((prev) => [
      ...prev,
      {
        name: "",
        url: "",
        description: "",
        target_persona: "",
        priority: 5,
      },
    ]);
  };

  const removeProductService = (index: number) => {
    setProductsServices((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // Required main fields
    if (!formData.company_name.trim()) {
      errors.company_name = "Company name is required";
    }
    if (!formData.website.trim()) {
      errors.website = "Website URL is required";
    } else if (!isValidUrl(formData.website)) {
      errors.website = "Please enter a valid URL (e.g., https://example.com)";
    }
    if (!formData.niche.trim()) {
      errors.niche = "Niche is required";
    }
    if (!formData.location) {
      errors.location = "Location is required";
    }
    if (!formData.target_personas.trim()) {
      errors.target_personas = "Target personas are required";
    }
    if (!formData.market_geo) {
      errors.market_geo = "Market/Geo targeting is required";
    }
    if (!formData.value_props.trim()) {
      errors.value_props = "Value propositions are required";
    }

    // Required product/service fields
    productsServices.forEach((product, index) => {
      if (!product.name.trim()) {
        errors[`productsServices[${index}].name`] = "Name is required";
      }
      if (!product.description.trim()) {
        errors[`productsServices[${index}].description`] =
          "Description is required";
      }
      if (!product.target_persona.trim()) {
        errors[`productsServices[${index}].target_persona`] =
          "Target persona is required";
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Helper function to validate URL format
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleCancelForm = () => {
    // Call the onCancel callback from props immediately
    onCancel();

    // Also dispatch an event as a backup to ensure the form disappears
    const parentUpdateEvent = new CustomEvent("formCancelled", {
      detail: {
        timestamp: Date.now(),
      },
    });
    window.dispatchEvent(parentUpdateEvent);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    // Just pass the data to parent component through onSubmit
    onSubmit({
      company_name: formData.company_name,
      website: formData.website,
      niche: formData.niche,
      location: formData.location,
      target_personas: formData.target_personas,
      market_geo: formData.market_geo,
      value_props: formData.value_props,
      products_services: productsServices,
    });
  };

  // Helper to get error for a field
  const getFieldError = (fieldName: string) => {
    return validationErrors[fieldName] || "";
  };

  // Helper to get error state for a field
  const hasFieldError = (fieldName: string) => {
    return !!validationErrors[fieldName];
  };

  // Helper to get error for a product/service field
  const getProductServiceError = (
    index: number,
    field: keyof ProductService
  ) => {
    const errorKey = `productsServices[${index}].${field}`;
    return validationErrors[errorKey] || "";
  };

  // Helper to get error state for a product/service field
  const hasProductServiceError = (
    index: number,
    field: keyof ProductService
  ) => {
    const errorKey = `productsServices[${index}].${field}`;
    return !!validationErrors[errorKey];
  };

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: "background.paper",
        borderRadius: 2,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
        }
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography
          variant="h6"
          color="primary"
          sx={{
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          Business Information
        </Typography>
        <IconButton
          onClick={handleCancelForm}
          size="small"
          sx={{
            color: "text.secondary",
            "&:hover": {
              color: "primary.main",
              backgroundColor: "rgba(0, 120, 255, 0.08)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {Object.keys(validationErrors).length > 0 && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 1.5,
            "& .MuiAlert-icon": {
              alignItems: "center",
            },
          }}
        >
          Please correct the highlighted fields before submitting.
        </Alert>
      )}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Company Name"
            name="company_name"
            value={formData.company_name}
            onChange={handleInputChange}
            required
            error={hasFieldError("company_name")}
            helperText={
              getFieldError("company_name") || "Enter your company's legal name"
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Website"
            name="website"
            type="url"
            value={formData.website}
            onChange={handleInputChange}
            required
            error={hasFieldError("website")}
            helperText={
              getFieldError("website") ||
              "Enter your company's website URL (e.g., https://example.com)"
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Niche"
            name="niche"
            value={formData.niche}
            onChange={handleInputChange}
            required
            error={hasFieldError("niche")}
            helperText={
              getFieldError("niche") || "e.g., E-commerce, SaaS, Healthcare"
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            select
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            error={hasFieldError("location")}
            helperText={
              getFieldError("location") || "Primary business location"
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
              },
            }}
          >
            {locations.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Target Personas"
            name="target_personas"
            value={formData.target_personas}
            onChange={handleInputChange}
            required
            error={hasFieldError("target_personas")}
            helperText={
              getFieldError("target_personas") ||
              "Describe your ideal customers (e.g., Small business owners, Tech-savvy millennials)"
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            select
            label="Market/Geo Targeting"
            name="market_geo"
            value={formData.market_geo}
            onChange={handleInputChange}
            required
            error={hasFieldError("market_geo")}
            helperText={
              getFieldError("market_geo") || "Select your target market scope"
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
              },
            }}
          >
            {marketGeoOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Unique Value Propositions"
            name="value_props"
            value={formData.value_props}
            onChange={handleInputChange}
            required
            error={hasFieldError("value_props")}
            helperText={
              getFieldError("value_props") ||
              "What makes your business unique? List your key advantages"
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
              },
            }}
          />
        </Grid>
      </Grid>

      <Typography
        variant="h6"
        sx={{
          mt: 4,
          mb: 2,
          fontWeight: 600,
          color: "primary.main",
          letterSpacing: 0.5,
        }}
      >
        Products & Services
      </Typography>

      {productsServices.map((product, index) => (
        <Paper
          key={index}
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            bgcolor: "background.default",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="600"
              color="text.primary"
            >
              Product/Service #{index + 1}
            </Typography>
            {productsServices.length > 1 && (
              <Button
                size="small"
                onClick={() => removeProductService(index)}
                sx={{
                  minWidth: 0,
                  borderRadius: 2,
                  color: "error.main",
                  px: 1.5,
                  py: 0.5,
                  borderColor: "error.main",
                  "&:hover": {
                    backgroundColor: "rgba(211, 47, 47, 0.08)",
                  },
                }}
                variant="outlined"
              >
                Remove
              </Button>
            )}
          </Box>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Product/Service Name"
                value={product.name}
                onChange={(e) =>
                  handleProductServiceChange(index, "name", e.target.value)
                }
                required
                error={hasProductServiceError(index, "name")}
                helperText={
                  getProductServiceError(index, "name") ||
                  "Name of your product or service"
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="URL"
                type="url"
                value={product.url}
                onChange={(e) =>
                  handleProductServiceChange(index, "url", e.target.value)
                }
                helperText="Optional: Link to product page or documentation"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={product.description}
                onChange={(e) =>
                  handleProductServiceChange(
                    index,
                    "description",
                    e.target.value
                  )
                }
                required
                error={hasProductServiceError(index, "description")}
                helperText={
                  getProductServiceError(index, "description") ||
                  "Brief description of features and benefits"
                }
                sx={{
                  height: "100px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Target Persona"
                value={product.target_persona}
                onChange={(e) =>
                  handleProductServiceChange(
                    index,
                    "target_persona",
                    e.target.value
                  )
                }
                required
                error={hasProductServiceError(index, "target_persona")}
                helperText={
                  getProductServiceError(index, "target_persona") ||
                  "Who is this product/service for?"
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
                sx={{ mt: 1, fontWeight: 500 }}
              >
                Priority Level (1-10)
              </Typography>
              <Slider
                value={
                  typeof product.priority === "string"
                    ? parseInt(product.priority)
                    : product.priority
                }
                onChange={(_, newValue) =>
                  handleProductServiceChange(
                    index,
                    "priority",
                    newValue as number
                  )
                }
                min={1}
                max={10}
                step={1}
                marks
                valueLabelDisplay="auto"
                sx={{
                  color: "primary.main",
                  "& .MuiSlider-thumb": {
                    width: 14,
                    height: 14,
                  },
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      ))}

      <Button
        startIcon={<AddIcon />}
        onClick={addProductService}
        variant="outlined"
        sx={{
          mb: 4,
          mt: 1,
          borderRadius: 2,
          px: 2,
          py: 1,
          textTransform: "none",
          fontWeight: 600,
          borderColor: "primary.main",
          "&:hover": {
            backgroundColor: "rgba(0, 120, 255, 0.08)",
          },
        }}
      >
        Add Another Product/Service
      </Button>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 2,
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={handleCancelForm}
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1,
            fontWeight: 600,
            textTransform: "none",
            borderColor: "divider",
            color: "text.secondary",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.05)",
              borderColor: "text.secondary",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          type="button"
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1,
            fontWeight: 600,
            textTransform: "none",
            boxShadow: 2,
            "&:hover": {
              boxShadow: 4,
            },
          }}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default BusinessInfoForm;
