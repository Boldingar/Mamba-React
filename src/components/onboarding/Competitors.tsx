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

const Competitors: React.FC<{
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

  const [competitors, setCompetitors] = useState([
    { name: "", description: "" },
    { name: "", description: "" },
  ]);

  // Sync with formData
  useEffect(() => {
    if (formData.competitors) {
      setCompetitors(formData.competitors);
    }
  }, [formData.competitors]);

  const handleAdd = () => {
    const newCompetitors = [...competitors, { name: "", description: "" }];
    setCompetitors(newCompetitors);
    setFormData({ ...formData, competitors: newCompetitors });
  };

  const handleDelete = (idx: number) => {
    const newCompetitors = competitors.filter((_, i) => i !== idx);
    setCompetitors(newCompetitors);
    setFormData({ ...formData, competitors: newCompetitors });
  };

  const handleChange = (idx: number, field: string, value: string) => {
    const newCompetitors = competitors.map((c, i) =>
      i === idx ? { ...c, [field]: value } : c
    );
    setCompetitors(newCompetitors);
    setFormData({ ...formData, competitors: newCompetitors });
  };

  return (
    <Box sx={{ width: "100%" }}>
      {competitors.map((competitor, idx) => (
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
            value={competitor.name}
            onChange={(e) => handleChange(idx, "name", e.target.value)}
            placeholder="Competitor"
            sx={textFieldSx}
          />
          <TextField
            fullWidth
            variant="outlined"
            value={competitor.description}
            onChange={(e) => handleChange(idx, "description", e.target.value)}
            placeholder="Description"
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

export default Competitors;
