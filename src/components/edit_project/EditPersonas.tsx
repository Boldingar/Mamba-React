import React from "react";
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
import { FormDataType, Persona } from "../onboarding/Onboarding";

// Create an extended interface that includes the optional id field
interface ExtendedFormDataType extends FormDataType {
  id?: string;
  gsc_site_url?: string | null;
}

interface PersonasProps {
  formData: ExtendedFormDataType;
  setFormData: (data: ExtendedFormDataType) => void;
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

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ mb: 2 }}>
        {formData.personas.map((persona, idx) => (
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
              {/* Name and Priority in a row */}
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Persona Name"
                  value={persona.name}
                  onChange={(e) => handleChange(idx, "name", e.target.value)}
                  placeholder="Enter persona name"
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
                  value={persona.priority}
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
                value={persona.description}
                onChange={(e) =>
                  handleChange(idx, "description", e.target.value)
                }
                placeholder="Enter persona description"
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
          Add Persona
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
          onClick={onNext}
        >
          Keep Moving →
        </Button>
      </Box>
    </Box>
  );
};

export default Personas;
