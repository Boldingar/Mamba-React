import React, { useState, useEffect } from "react";
import {
  Box,
  Stack,
  TextField,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material/styles";

const Personas: React.FC<{
  formData: any;
  setFormData: (data: any) => void;
  onBack?: () => void;
  onNext?: () => void;
}> = ({ formData, setFormData, onBack, onNext }) => {
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

  const [personas, setPersonas] = useState([
    { name: "", description: "", priority: "" },
    { name: "", description: "", priority: "" },
  ]);

  // Sync with formData
  useEffect(() => {
    if (formData.personas) {
      setPersonas(formData.personas);
    }
  }, [formData.personas]);

  const handleAdd = () => {
    const newPersonas = [
      ...personas,
      { name: "", description: "", priority: "" },
    ];
    setPersonas(newPersonas);
    setFormData({ ...formData, personas: newPersonas });
  };

  const handleDelete = (idx: number) => {
    const newPersonas = personas.filter((_, i) => i !== idx);
    setPersonas(newPersonas);
    setFormData({ ...formData, personas: newPersonas });
  };

  const handleChange = (idx: number, field: string, value: string) => {
    const newPersonas = personas.map((p, i) =>
      i === idx ? { ...p, [field]: value } : p
    );
    setPersonas(newPersonas);
    setFormData({ ...formData, personas: newPersonas });
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
        {personas.map((persona, idx) => (
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
              value={persona.name}
              onChange={(e) => handleChange(idx, "name", e.target.value)}
              placeholder="Persona"
              sx={textFieldSx}
            />
            <TextField
              fullWidth
              variant="outlined"
              value={persona.description}
              onChange={(e) => handleChange(idx, "description", e.target.value)}
              placeholder="Description"
              sx={textFieldSx}
            />
            <TextField
              fullWidth
              variant="outlined"
              value={persona.priority}
              onChange={(e) => handleChange(idx, "priority", e.target.value)}
              placeholder="Priority"
              sx={textFieldSx}
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

export default Personas;
