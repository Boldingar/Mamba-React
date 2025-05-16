import React, { useState } from "react";
import {
  Box,
  Stack,
  TextField,
  IconButton,
  Button,
  Typography,
  FormControl,
  FormLabel,
  Paper,
  Grid,
  MenuItem,
  Select,
  Tooltip,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import { useTheme } from "@mui/material/styles";
import { FormDataType, Product } from "./Onboarding";
import { useIsMobile } from "../../utils/responsive";

interface ProductsProps {
  formData: FormDataType;
  setFormData: (data: FormDataType) => void;
  onBack: () => void;
  onNext: () => void;
  showBackButton?: boolean;
}

const Products: React.FC<ProductsProps> = ({
  formData,
  setFormData,
  onBack,
  onNext,
  showBackButton = false,
}) => {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const [visibleProducts, setVisibleProducts] = useState(
    Math.min(2, formData.products.length) // Initially show 2 products or all if less than 2
  );
  const borderRadius = 3;
  const buttonStyles = {
    bgcolor: theme.palette.primary.main,
    color: "common.white",
    boxShadow: "none",
    borderRadius,
    textTransform: "none",
    "&:hover": {
      bgcolor: theme.palette.primary.dark,
      color: "common.white",
    },
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
    // Reset scroll position of all relevant containers
    const containers = document.querySelectorAll(
      '.MuiBox-root, [id$="-scrollable-container"]'
    );
    containers.forEach((container) => {
      (container as HTMLElement).scrollTo({ top: 0, behavior: "smooth" });
    });
    // Only include the visible products in the submission
    const submittableProducts = formData.products.slice(0, visibleProducts);
    setFormData({ ...formData, products: submittableProducts });
    onNext();
  };

  const handleBack = () => {
    // Reset scroll position of all relevant containers
    const containers = document.querySelectorAll(
      '.MuiBox-root, [id$="-scrollable-container"]'
    );
    containers.forEach((container) => {
      (container as HTMLElement).scrollTo({ top: 0, behavior: "smooth" });
    });
    onBack();
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box sx={{ flex: 1, overflow: "auto", mb: 2 }}>
        {formData.products.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              px: 2,
              bgcolor: "background.paper",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              mb: 3,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Products Found
            </Typography>
            <Typography color="text.secondary">
              We couldn't find any products in your website. You can add them
              manually using the button below.
            </Typography>
          </Box>
        )}
        {formData.products.slice(0, visibleProducts).map((product, idx) => (
          <Box
            key={idx}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              py: 3,
              px: 2,
              minHeight: 100,
              mb: 3,
              bgcolor: "background.paper",
            }}
          >
            {/* URL Row */}
            {product.url && (
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <TextField
                  label="Product URL"
                  variant="outlined"
                  value={product.url}
                  onChange={(e) => handleChange(idx, "url", e.target.value)}
                  placeholder="Product URL"
                  sx={{ ...textFieldSx, width: "80%" }}
                />
                <Box sx={{ flexGrow: 1 }} />
              </Stack>
            )}
            {/* Name and Priority Row */}
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: product.url ? 0 : 2 }}
            >
              <TextField
                label="Product Name"
                fullWidth
                variant="outlined"
                value={product.name}
                onChange={(e) => handleChange(idx, "name", e.target.value)}
                placeholder="Product Name"
                sx={{
                  ...textFieldSx,
                  width: "70%",
                }}
              />
              <TextField
                label="Priority"
                fullWidth
                type="number"
                variant="outlined"
                value={product.priority}
                onChange={(e) =>
                  handleChange(idx, "priority", Number(e.target.value))
                }
                placeholder="Priority"
                sx={{
                  ...textFieldSx,
                  width: "30%",
                }}
                inputProps={{ min: 1, max: 10 }}
              />
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
                <img
                  src={
                    theme.palette.mode === "dark" ? "/clearW.png" : "/clear.png"
                  }
                  alt="Clear"
                  style={{ width: 20, height: 20 }}
                />
              </IconButton>
              <IconButton
                onClick={() => handleDelete(idx)}
                color="error"
                aria-label="delete"
                sx={{
                  "&:hover": {
                    bgcolor: (theme) => theme.palette.error.light + "20",
                  },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
            {/* Description Row */}
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="Description"
                fullWidth
                multiline
                minRows={4}
                variant="outlined"
                value={product.description}
                onChange={(e) =>
                  handleChange(idx, "description", e.target.value)
                }
                placeholder="Description"
                sx={{ ...textFieldSx }}
              />
            </Stack>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton
          onClick={handleAdd}
          disabled={isAddButtonDisabled}
          sx={{
            ...buttonStyles,
            width: 40,
            height: 40,
            "&.Mui-disabled": {
              bgcolor: theme.palette.action.disabledBackground,
              color: theme.palette.action.disabled,
            },
          }}
          aria-label="add"
        >
          <AddIcon />
        </IconButton>
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
        {showBackButton && (
          <Button
            variant="contained"
            sx={{ ...buttonStyles, px: 3 }}
            onClick={handleBack}
          >
            Back
          </Button>
        )}
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
