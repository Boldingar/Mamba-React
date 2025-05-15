import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Integrations from "../integrations/Integrations";
import { useIsMobile } from "../../utils/responsive";

interface IntegrationsStepProps {
  onBack: () => void;
  onNext: () => void;
}

const IntegrationsStep: React.FC<IntegrationsStepProps> = ({
  onBack,
  onNext,
}) => {
  const theme = useTheme();
  const isMobile = useIsMobile();

  const buttonStyles = {
    textTransform: "none" as const,
    fontWeight: 500,
    py: 1.2,
    borderRadius: 1,
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        maxWidth: isMobile ? "100%" : "1200px",
        mx: "auto",
      }}
    >
      {/* <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Connect Your Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Connect your Google Search Console and Google Analytics accounts to
          get the most out of Mamba. This step is optional - you can always
          connect them later.
        </Typography>
      </Box> */}

      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          mb: 3,
          // Adjust height to make room for buttons
          maxHeight: isMobile ? "calc(100vh - 250px)" : "calc(100vh - 300px)",
          width: "100%",
          maxWidth: "100%",
          mt: isMobile ? 0 : 3,
        }}
      >
        <Integrations isEmbedded={true} />
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
          Skip for Now →
        </Button>
      </Box>
    </Box>
  );
};

export default IntegrationsStep;
