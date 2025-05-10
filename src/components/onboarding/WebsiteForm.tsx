import React from "react";
import {
  Stack,
  TextField,
  Link,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";

interface FormData {
  website: string;
  targetMarket: string;
  [key: string]: string;
}

interface WebsiteFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onNext?: () => void;
  onSkipToProducts?: () => void;
}

const WebsiteForm: React.FC<WebsiteFormProps> = ({
  formData,
  setFormData,
  onNext,
  onSkipToProducts,
}) => {
  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <Stack spacing={4} sx={{ width: "100%" }}>
        <Box>
          <TextField
            required
            id="website"
            name="website"
            label="Website URL"
            fullWidth
            variant="outlined"
            value={formData.website}
            onChange={handleTextChange}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (onSkipToProducts) onSkipToProducts();
                else if (onNext) onNext();
              }}
              sx={{
                textDecoration: "none",
                color: "text.secondary",
                fontSize: "0.875rem",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              I don't have a website yet →
            </Link>
          </Box>
        </Box>
        <FormControl fullWidth variant="outlined">
          <InputLabel id="target-market-label">Target Market</InputLabel>
          <Select
            required
            labelId="target-market-label"
            id="targetMarket"
            name="targetMarket"
            value={formData.targetMarket}
            onChange={handleSelectChange}
            label="Target Market"
            sx={{
              borderRadius: 2,
            }}
          >
            <MenuItem value="USA">USA 🇺🇸</MenuItem>
            <MenuItem value="Canada">Canada 🇨🇦</MenuItem>
            <MenuItem value="UK">United Kingdom 🇬🇧</MenuItem>
            <MenuItem value="Australia">Australia 🇦🇺</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Box>
  );
};

export default WebsiteForm;
