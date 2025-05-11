import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

interface SuccessProps {
  onBack: () => void;
  onNext: () => void;
}

const Success: React.FC<SuccessProps> = ({ onBack, onNext }) => {
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

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        p: 4,
      }}
    >
      <CheckCircleOutlineIcon
        sx={{
          fontSize: 80,
          color: "success.main",
          mb: 3,
        }}
      />
      <Typography variant="h4" align="center" gutterBottom>
        Great! Your project is ready
      </Typography>
      <Typography
        variant="body1"
        align="center"
        color="text.secondary"
        sx={{ mb: 6, maxWidth: 600 }}
      >
        We've analyzed your website and prepared everything. You can now start
        exploring your project and get AI-powered insights about your business.
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: 400,
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
          Get Started →
        </Button>
      </Box>
    </Box>
  );
};

export default Success;
