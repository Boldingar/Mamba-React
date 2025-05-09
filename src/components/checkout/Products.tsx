import React, { useState } from "react";
import { Box, Stack, TextField, IconButton, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material/styles";

const Products: React.FC<{
  formData: any;
  setFormData: (data: any) => void;
  onBack?: () => void;
  onNext?: () => void;
}> = ({ onBack, onNext }) => {
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

  const [products, setProducts] = useState([
    { name: "", description: "", priority: "" },
    { name: "", description: "", priority: "" },
  ]);

  const handleAdd = () => {
    setProducts([...products, { name: "", description: "", priority: "" }]);
  };

  const handleDelete = (idx: number) => {
    setProducts(products.filter((_, i) => i !== idx));
  };

  const handleChange = (idx: number, field: string, value: string) => {
    setProducts(
      products.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
    );
  };

  return (
    <Box sx={{ width: "100%" }}>
      {products.map((product, idx) => (
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
            placeholder="Product"
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
            variant="outlined"
            value={product.priority}
            onChange={(e) => handleChange(idx, "priority", e.target.value)}
            placeholder="Priority"
            sx={textFieldSx}
          />
          <IconButton
            onClick={() => handleDelete(idx)}
            color="error"
            aria-label="delete"
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      ))}
      <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton onClick={handleAdd} sx={buttonStyles} aria-label="add">
          <AddIcon />
        </IconButton>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
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
