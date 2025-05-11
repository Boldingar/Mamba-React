import React from "react";
import { Box, Stack, TextField, IconButton, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material/styles";
import { FormDataType, Persona } from "./Onboarding";

interface PersonasProps {
  formData: FormDataType;
  setFormData: (data: FormDataType) => void;
  onBack: () => void;
  onNext: () => void;
}

const Personas: React.FC<PersonasProps> = ({
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
    const newPersonas = [
      ...formData.personas,
      {
        name: "",
        description: "",
        priority: 5,
      },
    ];
    setFormData({ ...formData, personas: newPersonas });
  };

  const handleDelete = (idx: number) => {
    const newPersonas = formData.personas.filter((_, i) => i !== idx);
    setFormData({ ...formData, personas: newPersonas });
  };

  const handleChange = (
    idx: number,
    field: keyof Persona,
    value: string | number
  ) => {
    const newPersonas = formData.personas.map((p, i) =>
      i === idx ? { ...p, [field]: value } : p
    );
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
        {formData.personas.map((persona, idx) => (
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
              placeholder="Persona Name"
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
              type="number"
              variant="outlined"
              value={persona.priority}
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

export default Personas;
