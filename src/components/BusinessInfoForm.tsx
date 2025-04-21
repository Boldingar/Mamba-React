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
  RemoveIcon,
} from "./ui";
import Grid from "./Grid";

const API_BASE_URL = "http://127.0.0.1:5000";

interface ProductService {
  name: string;
  url: string;
  description: string;
  target_persona: string;
  priority: number;
}

interface BusinessInfoFormProps {
  onClose: () => void;
  onFileClick: (data: {
    title: string;
    headers: string[];
    rows: any[][];
  }) => void;
  onSubmit: (formData: any) => void;
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 2,
        backgroundColor: "transparent",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h6" color="primary">
          Business Information
        </Typography>
        <IconButton onClick={onClose} size="small" color="primary">
          <CloseIcon />
        </IconButton>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Company Name"
            name="company_name"
            value={formData.company_name}
            onChange={handleInputChange}
            required
            helperText="Enter your company's legal name"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Website"
            name="website"
            type="url"
            value={formData.website}
            onChange={handleInputChange}
            helperText="Optional: Your company's website URL"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Niche"
            name="niche"
            value={formData.niche}
            onChange={handleInputChange}
            helperText="e.g., E-commerce, SaaS, Healthcare"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            select
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            helperText="Primary business location"
          >
            {locations.map((option) => (
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
            label="Target Personas"
            name="target_personas"
            value={formData.target_personas}
            onChange={handleInputChange}
            helperText="Describe your ideal customers (e.g., Small business owners, Tech-savvy millennials)"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            select
            label="Market/Geo Targeting"
            name="market_geo"
            value={formData.market_geo}
            onChange={handleInputChange}
            required
            helperText="Select your target market scope"
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
            helperText="What makes your business unique? List your key advantages"
          />
        </Grid>
      </Grid>

      <Box mt={3} mb={2}>
        <Typography variant="subtitle1" color="primary">
          Products/Services
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Add your main products or services below
        </Typography>
      </Box>

      {productsServices.map((product, index) => (
        <Paper
          key={index}
          sx={{
            p: 2,
            mt: 2,
            backgroundColor: "background.default",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
          elevation={0}
        >
          <Grid container spacing={2}>
            <Grid
              size={{ xs: 12 }}
              sx={{ display: "flex", justifyContent: "flex-end" }}
            >
              <IconButton
                onClick={() => removeProductService(index)}
                size="small"
                color="error"
              >
                <RemoveIcon />
              </IconButton>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Product/Service Name"
                value={product.name}
                onChange={(e) =>
                  handleProductServiceChange(index, "name", e.target.value)
                }
                required
                helperText="Name of your product or service"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="URL"
                type="url"
                value={product.url}
                onChange={(e) =>
                  handleProductServiceChange(index, "url", e.target.value)
                }
                helperText="Optional: Link to product page or documentation"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
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
                helperText="Brief description of features and benefits"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Target Persona"
                value={product.target_persona}
                onChange={(e) =>
                  handleProductServiceChange(
                    index,
                    "target_persona",
                    e.target.value
                  )
                }
                helperText="Who is this product/service designed for?"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography gutterBottom color="text.secondary">
                Priority Level
              </Typography>
              <Slider
                value={product.priority}
                onChange={(_, value) =>
                  handleProductServiceChange(index, "priority", value as number)
                }
                min={1}
                max={10}
                marks
                valueLabelDisplay="auto"
              />
              <Typography variant="caption" color="text.secondary">
                Set the priority level from 1 (lowest) to 10 (highest)
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      ))}

      <Box mt={3} display="flex" gap={2} justifyContent="space-between">
        <Button
          startIcon={<AddIcon />}
          onClick={addProductService}
          variant="outlined"
          color="primary"
        >
          Add Product/Service
        </Button>
        <Button variant="contained" color="primary" type="submit" size="large">
          Submit Information
        </Button>
      </Box>
    </Box>
  );
};

export default BusinessInfoForm;
