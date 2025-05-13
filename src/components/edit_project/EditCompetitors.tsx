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
import { FormDataType, Competitor } from "../onboarding/Onboarding";

// Create an extended interface that includes the optional id field
interface ExtendedFormDataType extends FormDataType {
  id?: string;
  gsc_site_url?: string | null;
}

interface CompetitorsProps {
  formData: ExtendedFormDataType;
  setFormData: (data: ExtendedFormDataType) => void;
  onBack: () => void;
  onNext: () => void;
}

const Competitors: React.FC<CompetitorsProps> = ({
  formData,
  setFormData,
  onBack,
  onNext,
}) => {
  const theme = useTheme();
  const borderRadius = 1;
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
    const newCompetitors = [
      ...formData.competitors,
      {
        name: "",
        description: "",
      },
    ];
    setFormData({ ...formData, competitors: newCompetitors });
  };

  const handleDelete = (idx: number) => {
    const newCompetitors = formData.competitors.filter((_, i) => i !== idx);
    setFormData({ ...formData, competitors: newCompetitors });
  };

  const handleChange = (
    idx: number,
    field: keyof Competitor,
    value: string
  ) => {
    const newCompetitors = formData.competitors.map((c, i) =>
      i === idx ? { ...c, [field]: value } : c
    );
    setFormData({ ...formData, competitors: newCompetitors });
  };

  const handleClear = (idx: number) => {
    const newCompetitors = formData.competitors.map((c, i) =>
      i === idx
        ? {
            name: "",
            description: "",
          }
        : c
    );
    setFormData({ ...formData, competitors: newCompetitors });
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
        {formData.competitors.map((competitor, idx) => (
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
            {/* Action buttons positioned at the top right */}
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
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>

            <Stack spacing={4}>
              {/* Competitor Name */}
              <TextField
                fullWidth
                variant="outlined"
                label="Competitor Name"
                value={competitor.name}
                onChange={(e) => handleChange(idx, "name", e.target.value)}
                placeholder="Enter competitor name"
                sx={textFieldSx}
              />

              {/* Description on its own row */}
              <TextField
                fullWidth
                variant="outlined"
                label="Description"
                value={competitor.description}
                onChange={(e) =>
                  handleChange(idx, "description", e.target.value)
                }
                placeholder="Enter competitor description"
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
          Add Competitor
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
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default Competitors;
