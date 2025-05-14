import React from "react";
import {
  Box,
  Stack,
  TextField,
  IconButton,
  Button,
  Typography,
} from "@mui/material";
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

  const handleClear = (idx: number) => {
    const newPersonas = formData.personas.map((p, i) =>
      i === idx
        ? {
            name: "",
            description: "",
            priority: 5,
          }
        : p
    );
    setFormData({ ...formData, personas: newPersonas });
  };

  const handleNext = () => {
    // Reset scroll position of all relevant containers
    const containers = document.querySelectorAll(
      '.MuiBox-root, [id$="-scrollable-container"]'
    );
    containers.forEach((container) => {
      (container as HTMLElement).scrollTo({ top: 0, behavior: "smooth" });
    });
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
        {formData.personas.length === 0 && (
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
              No Target Personas Found
            </Typography>
            <Typography color="text.secondary">
              We couldn't identify your target personas. You can define them
              manually using the button below.
            </Typography>
          </Box>
        )}
        {formData.personas.map((persona, idx) => (
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
            {/* Name and Priority Row */}
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <TextField
                label="Persona Name"
                fullWidth
                variant="outlined"
                value={persona.name}
                onChange={(e) => handleChange(idx, "name", e.target.value)}
                placeholder="Persona Name"
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
                value={persona.priority}
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
                value={persona.description}
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
          onClick={handleBack}
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

export default Personas;
