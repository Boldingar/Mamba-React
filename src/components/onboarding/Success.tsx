import React from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useIsMobile } from "../../utils/responsive";

interface SuccessProps {
  onBack: () => void;
  onNext: () => void;
}

const Success: React.FC<SuccessProps> = ({ onBack, onNext }) => {
  const theme = useTheme();
  const isMobile = useIsMobile();

  const buttonStyles = {
    bgcolor: theme.palette.primary.main,
    color: "common.white",
    boxShadow: "none",
    borderRadius: 2,
    textTransform: "none",
    "&:hover": {
      bgcolor: theme.palette.primary.dark,
      color: "common.white",
    },
  };

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <Stack spacing={4} sx={{ width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            py: isMobile ? 2 : 4,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: isMobile ? "1.75rem" : "2.5rem",
              mb: 2,
            }}
          >
            We're all set! 🎉
          </Typography>
          <Typography
            variant="body1"
            sx={{
              maxWidth: "600px",
              mb: 3,
              fontSize: isMobile ? "0.9rem" : "1rem",
              px: isMobile ? 2 : 0,
            }}
          >
            We'll now build a personalized, comprehensive SEO strategy based on
            your business information. Let's get started with your new project!
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 3,
            pt: 3,
            borderTop: "1px solid",
            borderColor: "divider",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 2 : 0,
          }}
        >
          <Button
            onClick={onBack}
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: "text.primary",
              },
              width: isMobile ? "100%" : "auto",
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={onNext}
            sx={{
              ...buttonStyles,
              px: isMobile ? 3 : 4,
              py: isMobile ? 1 : 1.5,
              fontSize: isMobile ? "0.875rem" : "1rem",
              width: isMobile ? "100%" : "auto",
            }}
          >
            Complete Setup →
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default Success;
