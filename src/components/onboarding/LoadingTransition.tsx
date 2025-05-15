import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useIsMobile } from "../../utils/responsive";

interface LoadingTransitionProps {
  onComplete: () => void;
  isLoading: boolean;
}

const LoadingTransition: React.FC<LoadingTransitionProps> = ({
  onComplete,
  isLoading,
}) => {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Analyzing website...");
  const theme = useTheme();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isLoading) {
      // If loading is complete, quickly finish the progress
      setProgress(100);
      return;
    }

    const messages = [
      "Analyzing website structure...",
      "Identifying products and services...",
      "Analyzing target audience...",
      "Researching competitors...",
      "Generating insights...",
    ];

    let currentProgress = 0;
    const maxTime = 180000; // 3 minutes
    const interval = 100; // Update every 100ms
    const steps = maxTime / interval;
    const increment = 99 / steps; // Max at 99% in case API takes longer

    const progressTimer = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 99) {
        clearInterval(progressTimer);
        clearInterval(messageTimer);
        setProgress(99);
        setMessage("Almost there...");
      } else {
        setProgress(currentProgress);
      }
    }, interval);

    const messageTimer = setInterval(() => {
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 3000);

    return () => {
      clearInterval(progressTimer);
      clearInterval(messageTimer);
    };
  }, [isLoading]);

  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2000,
        minHeight: "100vh",
        minWidth: "100vw",
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 5,
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 2 : 0,
        }}
      >
        <CircularProgress
          size={isMobile ? 48 : 56}
          sx={{
            color: theme.palette.primary.main,
            mr: isMobile ? 0 : 4,
          }}
          thickness={4.5}
        />
        <Typography
          variant={isMobile ? "h5" : "h4"}
          fontWeight={700}
          color="text.primary"
          sx={{
            fontSize: isMobile ? 20 : { xs: 28, md: 38 },
            textAlign: isMobile ? "center" : "left",
          }}
        >
          {message}
        </Typography>
      </Box>
      <Box sx={{ width: 480, maxWidth: "95%", mb: 2 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 14,
            borderRadius: 7,
            bgcolor: "grey.100",
            "& .MuiLinearProgress-bar": {
              borderRadius: 7,
            },
          }}
        />
      </Box>
      <Typography
        variant="h6"
        color="text.secondary"
        sx={{ fontSize: { xs: 18, md: 22 } }}
      >
        {Math.round(progress)}% completed
      </Typography>
    </Box>
  );
};

export default LoadingTransition;
