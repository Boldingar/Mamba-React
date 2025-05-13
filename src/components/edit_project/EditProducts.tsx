import React, { useState } from "react";
import {
  Box,
  Stack,
  TextField,
  IconButton,
  Button,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import { useTheme } from "@mui/material/styles";
import { FormDataType } from "../onboarding/Onboarding";

// Create an extended interface that includes the optional id field
interface ExtendedFormDataType extends FormDataType {
  id?: string;
  gsc_site_url?: string | null;
}

interface ProductsProps {
  formData: ExtendedFormDataType;
  setFormData: (data: ExtendedFormDataType) => void;
  onBack: () => void;
  onNext: () => void;
}

const Products: React.FC<ProductsProps> = ({
  formData,
  setFormData,
  onBack,
  onNext,
}) => {
  const theme = useTheme();
  const [visibleProducts, setVisibleProducts] = useState(
    Math.min(5, formData.products.length) // Initially show 5 products or all if less than 5
  );
  // Use a fixed border radius of 1
  const borderRadius = 1;
  const buttonStyles = {
    boxShadow: "none",
    borderRadius,
    textTransform: "none",
  };

  const textFieldSx = {
    borderRadius,
    "& .MuiOutlinedInput-root": {
      borderRadius,
    },
  };

  // Ensure we never exceed 5 products
  React.useEffect(() => {
    if (formData.products.length > 5) {
      const limitedProducts = formData.products.slice(0, 5);
      setFormData({ ...formData, products: limitedProducts });
    }
  }, [formData.products]);

  const handleAdd = () => {
    if (visibleProducts < formData.products.length) {
      // If we have products that are not visible yet, show one more
      setVisibleProducts((prev) => prev + 1);
    } else if (formData.products.length < 5) {
      // If all products are visible but we have less than 5, add a new one
      const newProducts = [
        ...formData.products,
        {
          url: "",
          name: "",
          language: "en",
          priority: 5,
          description: "",
        },
      ];
      setFormData({ ...formData, products: newProducts });
      setVisibleProducts((prev) => prev + 1);
    }
  };

  const handleDelete = (idx: number) => {
    const newProducts = formData.products.filter((_, i) => i !== idx);
    setFormData({ ...formData, products: newProducts });
    setVisibleProducts((prev) => Math.min(prev, newProducts.length));
  };

  const handleChange = (idx: number, field: string, value: string | number) => {
    const newProducts = formData.products.map((p, i) =>
      i === idx ? { ...p, [field]: value } : p
    );
    setFormData({ ...formData, products: newProducts });
  };

  const handleClear = (idx: number) => {
    const newProducts = formData.products.map((p, i) =>
      i === idx
        ? {
            url: "",
            name: "",
            language: "en",
            priority: 5,
            description: "",
          }
        : p
    );
    setFormData({ ...formData, products: newProducts });
  };

  // The Add button should only be disabled when we have 5 visible products
  const isAddButtonDisabled = visibleProducts >= 5;

  const handleNext = () => {
    // Only include the visible products in the submission
    const submittableProducts = formData.products.slice(0, visibleProducts);
    setFormData({ ...formData, products: submittableProducts });
    onNext();
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ mb: 2 }}>
        {formData.products.slice(0, visibleProducts).map((product, idx) => (
          <Paper
            key={idx}
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              borderRadius,
              position: "relative",
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "transparent",
              minHeight: "220px",
              pt: 9,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                display: "flex",
                gap: 1,
                zIndex: 1,
              }}
            >
              <IconButton
                onClick={() => handleClear(idx)}
                color="primary"
                aria-label="clear"
                sx={{
                  "&:hover": {
                    bgcolor: (theme) => theme.palette.primary.light + "20",
                  },
                }}
              >
                <ClearAllIcon />
              </IconButton>
              <IconButton
                onClick={() => handleDelete(idx)}
                color="error"
                aria-label="delete"
                sx={{
                  "&:hover": {
                    bgcolor: (theme) => theme.palette.error.light + "20",
                  },
                  color: theme.palette.error.main,
                }}
              >
                <DeleteIcon color="inherit" />
              </IconButton>
            </Box>

            <Stack spacing={4}>
              {/* URL field on its own row */}
              <TextField
                fullWidth
                variant="outlined"
                label="Website URL"
                value={product.url}
                onChange={(e) => handleChange(idx, "url", e.target.value)}
                placeholder="https://example.com"
                sx={textFieldSx}
              />

              {/* Name and Priority in a row */}
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Product Name"
                  value={product.name}
                  onChange={(e) => handleChange(idx, "name", e.target.value)}
                  placeholder="Enter product name"
                  sx={{
                    ...textFieldSx,
                    width: "80%",
                  }}
                />
                <TextField
                  fullWidth
                  type="number"
                  variant="outlined"
                  label="Priority"
                  value={product.priority}
                  onChange={(e) =>
                    handleChange(idx, "priority", Number(e.target.value))
                  }
                  placeholder="1-10"
                  sx={{
                    ...textFieldSx,
                    width: "20%",
                  }}
                  inputProps={{ min: 1, max: 10 }}
                />
              </Stack>

              {/* Description on its own row */}
              <TextField
                fullWidth
                variant="outlined"
                label="Description"
                value={product.description}
                onChange={(e) =>
                  handleChange(idx, "description", e.target.value)
                }
                placeholder="Enter product description"
                multiline
                rows={4}
                sx={{
                  ...textFieldSx,
                  "& .MuiInputBase-root": {
                    minHeight: "120px",
                  },
                  "& .MuiOutlinedInput-input": {
                    height: "auto !important",
                  },
                }}
              />
            </Stack>
          </Paper>
        ))}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          startIcon={<AddIcon />}
          onClick={handleAdd}
          disabled={isAddButtonDisabled}
          variant="outlined"
          color="primary"
          sx={{
            borderRadius,
            textTransform: "none",
            "&.Mui-disabled": {
              borderColor: theme.palette.action.disabledBackground,
              color: theme.palette.action.disabled,
            },
          }}
          aria-label="add"
        >
          Add Product
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 4,
          pt: 2,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button
          variant="contained"
          sx={{ ...buttonStyles, px: 3 }}
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          variant="contained"
          sx={{ ...buttonStyles, px: 6 }}
          onClick={handleNext}
        >
          Keep Moving →
        </Button>
      </Box>
    </Box>
  );
};

export default Products;
