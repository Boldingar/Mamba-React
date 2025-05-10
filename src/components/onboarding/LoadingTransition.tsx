import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface LoadingTransitionProps {
  onComplete: () => void;
  durationSeconds?: number; // total duration for the loading (default: 2 seconds)
}

const LoadingTransition: React.FC<LoadingTransitionProps> = ({
  onComplete,
  durationSeconds = 30,
}) => {
  const [progress, setProgress] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    const durationMs = durationSeconds * 1000;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const percent = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(percent);
      if (percent >= 100) {
        clearInterval(interval);
        setTimeout(onComplete, 400); // small delay for smoothness
      }
    }, 30);
    return () => clearInterval(interval);
  }, [durationSeconds, onComplete]);

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
      <Box sx={{ display: "flex", alignItems: "center", mb: 5 }}>
        <CircularProgress
          size={56}
          sx={{ color: theme.palette.primary.main, mr: 4 }}
          thickness={4.5}
        />
        <Typography
          variant="h4"
          fontWeight={700}
          color="text.primary"
          sx={{ fontSize: { xs: 28, md: 38 } }}
        >
          Analyzing your website...
        </Typography>
      </Box>
      <Box sx={{ width: 480, maxWidth: "95%", mb: 2 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 14, borderRadius: 7, bgcolor: "grey.100" }}
        />
      </Box>
      <Typography
        variant="h6"
        color="text.secondary"
        sx={{ fontSize: { xs: 18, md: 22 } }}
      >
        {progress}% completed
      </Typography>
    </Box>
  );
};

export default LoadingTransition;
