import React, { useState } from "react";
import { Box, Stack, TextField, IconButton, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import { useTheme } from "@mui/material/styles";
import { FormDataType } from "./Onboarding";

interface ProductsProps {
  formData: FormDataType;
  setFormData: (data: FormDataType) => void;
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
        height: "100%",
      }}
    >
      <Box sx={{ flex: 1, overflow: "auto", mb: 2 }}>
        {formData.products.slice(0, visibleProducts).map((product, idx) => (
          <Stack
            key={idx}
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <TextField
              fullWidth
              variant="outlined"
              value={product.name}
              onChange={(e) => handleChange(idx, "name", e.target.value)}
              placeholder="Product Name"
              sx={{
                ...textFieldSx,
                width: "30%",
              }}
            />
            <TextField
              fullWidth
              variant="outlined"
              value={product.description}
              onChange={(e) => handleChange(idx, "description", e.target.value)}
              placeholder="Description"
              sx={{
                ...textFieldSx,
                width: "55%",
              }}
            />
            <TextField
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
                width: "15%",
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
                src="/clear.png"
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
