import React from "react";
import { Box, Stack, TextField, IconButton, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
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

  const handleAdd = () => {
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
  };

  const handleDelete = (idx: number) => {
    const newProducts = formData.products.filter((_, i) => i !== idx);
    setFormData({ ...formData, products: newProducts });
  };

  const handleChange = (idx: number, field: string, value: string | number) => {
    const newProducts = formData.products.map((p, i) =>
      i === idx ? { ...p, [field]: value } : p
    );
    setFormData({ ...formData, products: newProducts });
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
        {formData.products.map((product, idx) => (
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
              sx={textFieldSx}
            />
            <TextField
              fullWidth
              variant="outlined"
              value={product.description}
              onChange={(e) => handleChange(idx, "description", e.target.value)}
              placeholder="Description"
              sx={textFieldSx}
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
              sx={textFieldSx}
              inputProps={{ min: 1, max: 10 }}
            />
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
          sx={{
            ...buttonStyles,
            width: 40,
            height: 40,
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
          onClick={onNext}
        >
          Keep Moving →
        </Button>
      </Box>
    </Box>
  );
};

export default Products;
