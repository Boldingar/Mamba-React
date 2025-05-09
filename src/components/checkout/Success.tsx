import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

const Success: React.FC<{ onBack?: () => void; onNext?: () => void }> = ({
  onBack,
  onNext,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const buttonStyles = {
    bgcolor: theme.palette.primary.main,
    color: theme.palette.common.white,
    boxShadow: "none",
    borderRadius: 2,
    textTransform: "none",
    "&:hover": {
      bgcolor: theme.palette.primary.dark,
      color: theme.palette.common.white,
    },
  };

  const handleStart = () => {
    navigate("/chat");
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 8,
      }}
    >
      {/* <Typography
        variant="h3"
        sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center" }}
      >
        You're all set{" "}
        <span style={{ marginLeft: 8, fontSize: "2rem" }}>✅</span>
      </Typography> */}
      <Typography sx={{ fontSize: "1.1rem", color: "text.primary", mb: 4 }}>
        Let's get to building a comprehensive SEO Strategy for your business!
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: 400,
          mt: 2,
          gap: 2,
        }}
      >
        <Button
          variant="contained"
          sx={{ ...buttonStyles, px: 3 }}
          onClick={onBack}
        >
          Forgot something ?
        </Button>
        <Button
          variant="contained"
          sx={{ ...buttonStyles, px: 6 }}
          onClick={handleStart}
        >
          Get Started.
        </Button>
      </Box>
    </Box>
  );
};

export default Success;
