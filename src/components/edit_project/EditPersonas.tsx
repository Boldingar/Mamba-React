import React from "react";
import {
  Box,
  Stack,
  TextField,
  IconButton,
  Button,
  Paper,
  FormControl,
  FormLabel,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
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
              zIndex: 1,
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
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <FormControl sx={{ width: "80%" }}>
                  <FormLabel htmlFor={`persona-name-${idx}`}>
                    Persona Name
                  </FormLabel>
                  <TextField
                    id={`persona-name-${idx}`}
                    fullWidth
                    placeholder="Enter persona name"
                    value={persona.name}
                    onChange={(e) => handleChange(idx, "name", e.target.value)}
                  />
                </FormControl>
                <FormControl sx={{ width: "20%" }}>
                  <FormLabel htmlFor={`persona-priority-${idx}`}>
                    Priority
                  </FormLabel>
                  <TextField
                    id={`persona-priority-${idx}`}
                    fullWidth
                    type="number"
                    placeholder="1-10"
                    value={persona.priority}
                    onChange={(e) =>
                      handleChange(idx, "priority", Number(e.target.value))
                    }
                    inputProps={{ min: 1, max: 10 }}
                  />
                </FormControl>
              </Stack>

              {/* Description on its own row */}
              <FormControl fullWidth>
                <FormLabel htmlFor={`persona-desc-${idx}`}>
                  Description
                </FormLabel>
                <TextField
                  id={`persona-desc-${idx}`}
                  fullWidth
                  placeholder="Enter persona description"
                  value={persona.description}
                  onChange={(e) =>
                    handleChange(idx, "description", e.target.value)
                  }
                  multiline
                  rows={4}
                  sx={{
                    "& .MuiInputBase-root": {
                      minHeight: "120px",
                    },
                    "& .MuiOutlinedInput-input": {
                      height: "auto !important",
                    },
                  }}
                />
              </FormControl>
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
    </Box>
  );
};

export default Personas;
